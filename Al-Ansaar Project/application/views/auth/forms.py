"""Python class which represents the form data and its attributes used in
the auth blueprint. A Form class inherits from FlaskForm.
"""
from flask import flash, Markup
from flask_wtf import FlaskForm
from wtforms import (
    StringField,
    PasswordField,
    SubmitField,
)
from wtforms.validators import DataRequired, Length, EqualTo, ValidationError

from application.models import ADUM


class LoginForm(FlaskForm):
    email = StringField("Email Address", validators=[DataRequired()])
    pw_label = Markup(
        'Password <span class="p-viewer"><i class="material-icons" id="togglePassword" style="margin-left: 250px;">visibility_off</i></span>'
    )
    password = PasswordField(pw_label, validators=[DataRequired()])
    submit = SubmitField("Login")

    def validate_email(self, email):
        try:
            email = ADUM.query.filter_by(email=email.data).first()

        except Exception as e:
            flash(
                "There was a network connection issue. Please refresh the page and try logging in again.",
                "danger",
            )
        if email is None:
            flash("Invalid Login, Please try again", "danger")
            raise ValidationError()


class RequestResetForm(FlaskForm):
    email = StringField("Email Address", validators=[DataRequired()])
    submit = SubmitField("Request Password Reset")

    def validate_email(self, email):
        email = ADUM.query.filter_by(email=email.data).first()
        if email is None:
            raise ValidationError(
                "Email account does not exist, please contact your administrator"
            )


class ResetPasswordForm(FlaskForm):
    password = PasswordField("", validators=[DataRequired(), Length(min=7, max=50)])
    confirm_password = PasswordField(
        "", validators=[DataRequired(), EqualTo("password")]
    )
    submit = SubmitField("Reset Password")
