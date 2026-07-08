from flask import Blueprint, jsonify, request, session

from . import db
from .decorators import login_required
from .models import User
from .validators import validate_email, validate_password, validate_username

auth_bp = Blueprint("auth", __name__)


def _error(message, status=400):
    return jsonify({"error": message}), status


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    error = validate_username(username) or validate_email(email) or validate_password(password)
    if error:
        return _error(error)

    if User.query.filter_by(username=username).first():
        return _error("Username is already taken.", 409)

    if User.query.filter_by(email=email).first():
        return _error("Email is already registered.", 409)

    user = User(username=username, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully.", "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    identifier = (data.get("username") or data.get("email") or "").strip()
    password = data.get("password") or ""

    if not identifier or not password:
        return _error("Username/email and password are required.")

    user = User.query.filter(
        (User.username == identifier) | (User.email == identifier.lower())
    ).first()

    if not user or not user.check_password(password):
        return _error("Invalid credentials.", 401)

    session["user_id"] = user.id

    return jsonify({"message": "Login successful.", "user": user.to_dict()}), 200


@auth_bp.post("/logout")
@login_required
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logged out successfully."}), 200


@auth_bp.get("/me")
@login_required
def me():
    user = db.session.get(User, session["user_id"])
    if not user:
        session.pop("user_id", None)
        return _error("Authentication required.", 401)
    return jsonify({"user": user.to_dict()}), 200
