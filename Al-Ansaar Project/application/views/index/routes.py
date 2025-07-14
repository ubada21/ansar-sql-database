from flask import flash
from sqlalchemy.exc import IntegrityError

from flask import (
    render_template,
    Blueprint,
    redirect,
    url_for,
    request
)
from flask_login import login_required, current_user
from application.extensions import db
from application.models import ADUM
from werkzeug.security import generate_password_hash

main = Blueprint("main", __name__)

@main.route("/home", methods=["GET", "POST"])
@login_required
def home():
    if request.method == "POST":
        first_name = request.form.get("first_name")
        last_name = request.form.get("last_name")
        email = request.form.get("email")
        password = request.form.get("password")

        try:
            new_user = ADUM(
                first_name=first_name,
                last_name=last_name,
                email=email,
                password=generate_password_hash(password),
            )
            db.session.add(new_user)
            db.session.commit()
            flash("User added successfully!", "success")
        except IntegrityError:
            db.session.rollback()
            flash("Email already exists. Please try another.", "danger")
        except Exception:
            db.session.rollback()
            flash("Something went wrong. Please try again.", "danger")

        return redirect(url_for("main.home"))

    users = ADUM.query.all()

    return render_template(
        "home.html",
        title="Home",
        users=users
    )
@main.route("/")
def index():
    return redirect(url_for("main.home"))
