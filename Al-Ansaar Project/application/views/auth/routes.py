from flask import render_template, session, url_for, redirect, flash
from flask import Blueprint, request
from flask_login import login_user, current_user, logout_user, login_required
from application.models import ADUM, ADRT, ADUT
from application.extensions import bcrypt
from application.extensions import db


from .forms import LoginForm, RequestResetForm, ResetPasswordForm

import os
from dotenv import load_dotenv
from pathlib import Path


base_dir = os.path.dirname(os.path.abspath(__file__))
base_dir = Path(__file__).parents[2]
load_dotenv(os.path.join(base_dir, ".env"))

auth = Blueprint(
    "auth",
    __name__,
    template_folder="templates",
)

@auth.route("/login", methods=["Get", "Post"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("main.index"))
    form = LoginForm()

    if form.validate_on_submit():
        user = ADUM.query.filter_by(email=form.email.data).first()
        session["email"] = request.form.get("email")
        session["Name"] = user.first_name + " " + user.last_name
        

        # This is to get the ip of user without grabbing the NGINX service ip
        if request.environ.get("HTTP_X_FORWARDED_FOR") is None:
            ip_address = request.environ["REMOTE_ADDR"]
        else:
            ip_address = request.environ["HTTP_X_FORWARDED_FOR"]

        role = ADRT.query.filter_by(id=user.role_id).first()
        user_login_time = ADUT(
            user_id=user.id,
            login_ip=ip_address,
        )
        db.session.add(user_login_time)
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()

        session["transaction_id"] = user_login_time.id
        session["role"] = role.name

        company_logo = None

        if not company_logo:
            session[
                "logo"
            ] = "https://mucho-bravado.com/wp-content/uploads/2015/12/White-Label-logo.svg"
        else:
            session["logo"] = company_logo.data

        try:
            if user and bcrypt.check_password_hash(user.password, form.password.data):
                login_user(user)
                next_page = request.args.get("next")
                return (
                    redirect(next_page) if next_page else redirect(url_for("main.home"))
                )
            else:
                flash("Invalid Login, Please try again", "danger")
        except ValueError as ve:
            flash(
                "You have not setup your password yet. Please click the reset password button below.",
                "info",
            )
    else:
        for field, errors in form.errors.items():
            for error in errors:
                print (error)
    return render_template("login.html", form=form, title="Sign In")


@auth.route("/reset-password", methods=["Get", "Post"])
def reset_request():
    
    if current_user.is_authenticated:
        return redirect(url_for("main.index"))
    form = RequestResetForm()
    if form.validate_on_submit():
        user = ADUM.query.filter_by(email=form.email.data).first()
        flash(
            "Eamil functionality not setup. No email has been sent",
            "info",
        )
        return redirect(url_for("auth.login"))
    return render_template("reset-request.html", title="Reset Password", form=form)


@auth.route("/reset-password/<token>", methods=["Get", "Post"])
def reset_token(token):
    
    if current_user.is_authenticated:
        return redirect(url_for("main.index"))
    user = ADUM.verify_reset_token(token)
    if user is None:
        flash("That is an invalid or expried token", "warning")
        return redirect(url_for("auth.login"))
    form = ResetPasswordForm()
    if form.validate_on_submit():
        # bcrypt the user data
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode(
            "utf-8"
        )
        user.password = hashed_password
        try:
            db.session.commit()
        except Exception as e:
            print("Error: ", e)
            db.session.rollback()
        flash("Your password has been updated! You are now able to log in", "success")
        return redirect(url_for("auth.login"))
    return render_template("reset-token.html", title="Reset Password", form=form)


@auth.route("/logout", methods=["GET", "POST"])
@login_required
def logout():

    logout_user()
    session.clear()
    return redirect(url_for("auth.login"))
