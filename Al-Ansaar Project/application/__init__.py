import os
from dotenv import load_dotenv
load_dotenv()

from flask import (
    Flask,
    render_template,
    session,
    current_app,
    send_from_directory,
    request,
)
from datetime import timedelta
import traceback
from flask_login import login_required
from config import config
from .views.index.routes import main
from .views.auth.routes import auth
from .views.database.routes import database


from .extensions import db
from .extensions import bcrypt
from .extensions import lm
from .extensions import secure_headers



def register_blueprints_on_app(app):
    app.register_blueprint(main)
    app.register_blueprint(auth)
    app.register_blueprint(database, url_prefix="/database")
    

def create_app(config_env=None, register_blueprints=True):
    if config_env is None:
        load_dotenv()
        config_env = os.getenv("ENV", "development")
    
    app = Flask(__name__)
    app.config.from_object(config[config_env])
    app.secret_key = os.getenv("SECRET_KEY", "fallback_default_key")


    db.init_app(app)
    bcrypt.init_app(app)
    lm.init_app(app)
    lm.login_view = "auth.login"
    lm.login_message_category = "info"
    lm.refresh_view = "auth.login"
    lm.needs_refresh_message = "Session timedout, please re-login"
    lm.login_message_category = "info"

    # if there is an exception while handeling DB query, roll back the transactions
    @app.teardown_request
    def teardown_request(exception):
        if exception:
            db.session.rollback()
        db.session.remove()

    @app.before_request
    def my_func():
        session.modified = True

    @app.before_request
    def before_request():
        session.permanent = True
        current_app.permanent_session_lifetime = timedelta(hours=24)

    @app.after_request
    def set_secure_headers(response):
        secure_headers.framework.flask(response)
        return response

    @app.route("/favicon.ico")
    @login_required
    def favicon():
        return send_from_directory(
            os.path.join(current_app.root_path, "static"),
            "favicon.ico",
            mimetype="image/vnd.microsoft.icon",
        )

    @app.errorhandler(404)
    def page_not_found(e):
        return render_template("404.html"), 404

    @app.errorhandler(500)
    def internal_server_error(e):
        error_msg = traceback.format_exc()
        user_email = session.get("email")
        if not user_email:
            user_email = "unknown"
        url = request.url
        return render_template("500.html"), 500

    @app.route("/create-db", methods=["Get"])
    def create_db():
        db.create_all()
        return "DB created"

    if register_blueprints:
        register_blueprints_on_app(app)

    return app
