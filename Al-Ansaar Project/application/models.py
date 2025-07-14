from datetime import datetime
from flask import current_app
from flask_login import UserMixin, current_user
from itsdangerous import URLSafeTimedSerializer as Serializer
from .extensions import lm
from .extensions import db


@lm.user_loader
def load_user(user_id):
    return ADUM.query.get(int(user_id))


# ADUM = Admin User Main
class ADUM(UserMixin, db.Model):
    __tablename__ = "tbl_PortalUsers"

    id = db.Column("Id", db.Integer, primary_key=True)
    email = db.Column("Email", db.String(60), unique=True, nullable=False)
    first_name = db.Column("FirstName", db.String(20), unique=False, nullable=False)
    last_name = db.Column("LastName", db.String(20), unique=False, nullable=False)
    password = db.Column("Password", db.String(64), nullable=False)
    entered_by = db.Column(
        "EnteredBy", db.Integer, nullable=False, default=lambda: current_user.id
    )
    date_entered_utc = db.Column(
        "DateEnteredUTC", db.DateTime, nullable=False, default=datetime.utcnow
    )
    last_updated_by = db.Column(
        "LastUpdatedBy", db.Integer, nullable=False, default=lambda: current_user.id
    )
    last_updated_utc = db.Column(
        "LastUpdatedUTC", db.DateTime, nullable=False, default=datetime.utcnow
    )
    role_id = db.Column(
        "RoleId",
        db.Integer,
        db.ForeignKey("tbl_RoleTypes.id"),
        unique=False,
        nullable=False,
        default=1,
    )
    time_zone_id = db.Column(
        "TimeZoneId",
        db.Integer,
        db.ForeignKey("tbl_TimeZones.id"),
        unique=False,
        nullable=False,
        default=1,
    )
    inactive_flag = db.Column("InactiveFlag", db.Boolean, nullable=False, default=False)

    def get_reset_token(self):
        serializer = Serializer(current_app.config["SECRET_KEY"])
        return serializer.dumps({"user_id": self.id})

    @staticmethod
    def verify_reset_token(token):
        serializer = Serializer(current_app.config["SECRET_KEY"])
        try:
            user_id = serializer.loads(token, max_age=1800)[
                "user_id"
            ]  # 1800 seconds = 30 minutes
        except Exception:
            return None
        return ADUM.query.get(user_id)

    def __repr__(self):
        return f"ADUM('{self.id}', '{self.email}')"

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self):
        db.session.commit()
        db.session.expunge_all()


# ADRT = Admin Role Types
class ADRT(db.Model):
    __tablename__ = "tbl_RoleTypes"

    id = db.Column("id", db.Integer, primary_key=True)
    name = db.Column("Name", db.String(20), unique=True)
    description = db.Column("Description", db.String(200))
    entered_by = db.Column(
        "EnteredBy", db.Integer, nullable=False, default=lambda: current_user.id
    )
    date_entered_utc = db.Column(
        "DateEnteredUTC", db.DateTime, nullable=False, default=datetime.utcnow
    )
    last_updated_by = db.Column(
        "LastUpdatedBy", db.Integer, nullable=False, default=lambda: current_user.id
    )
    last_updated_utc = db.Column(
        "LastUpdatedUTC", db.DateTime, nullable=False, default=datetime.utcnow
    )
    inactive_flag = db.Column("InactiveFlag", db.Boolean, nullable=False, default=False)

    def __repr__(self):
        return f"ADRT('{self.id}', '{self.name}')"

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self):
        db.session.commit()
        db.session.expunge_all()


# ADTZ = Admin Time Zones
class ADTZ(db.Model):
    __tablename__ = "tbl_TimeZones"

    id = db.Column("id", db.Integer, primary_key=True)
    name = db.Column("Name", db.String(20), unique=True)
    description = db.Column("Description", db.String(200))
    date_entered_utc = db.Column(
        "DateCreated", db.DateTime, nullable=False, default=datetime.utcnow
    )
    last_updated_utc = db.Column(
        "DateUpdated", db.DateTime, nullable=False, default=datetime.utcnow
    )
    inactive_flag = db.Column("InactiveFlag", db.Boolean, nullable=False, default=False)

    def __repr__(self):
        return f"ADTZ('{self.id}', '{self.name}')"

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self):
        db.session.commit()
        db.session.expunge_all()


# ADUT = Admin User Transaction
class ADUT(db.Model):
    __tablename__ = "tbl_PortalUserTransactions"

    id = db.Column("Id", db.Integer, primary_key=True)
    user_id = db.Column("UserId", db.Integer, db.ForeignKey("tbl_PortalUsers.Id"), nullable=False)
    login_ip = db.Column("LoginIP", db.String(60), nullable=False)
    login_time = db.Column(
        "LoginTime", db.DateTime, nullable=False, default=datetime.utcnow
    )
    logout_time = db.Column(
        "LogoutTime", db.DateTime, nullable=False, default=datetime.utcnow
    )

    def __repr__(self):
        return f"ADUT('{self.id}', '{self.user_id}')"

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self):
        db.session.commit()
        db.session.expunge_all()

