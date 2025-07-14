from flask import Blueprint
from flask_login import login_required
from application.extensions import db

database = Blueprint("database", __name__)

@database.route("/create-db", methods=["Get", "Post"])
def create_db():
    db.create_all()
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
    return "made"
