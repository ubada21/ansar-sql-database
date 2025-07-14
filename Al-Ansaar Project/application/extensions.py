"""Various 3rd party flask extensions that are intialized to be used
in app factory.
"""
from secure import Secure
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager


db = SQLAlchemy()
secure_headers = Secure()
bcrypt = Bcrypt()
lm = LoginManager()


