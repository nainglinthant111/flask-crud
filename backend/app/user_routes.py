from flask import Blueprint, jsonify, request, session

from . import db
from .decorators import login_required
from .models import User
from .validators import validate_email, validate_password, validate_username

users_bp = Blueprint("users", __name__)


def _error(message, status=400):
    return jsonify({"error": message}), status


@users_bp.get("")
@login_required
def list_users():
    users = User.query.order_by(User.id).all()
    return jsonify({"users": [user.to_dict() for user in users]}), 200


@users_bp.get("/<int:user_id>")
@login_required
def get_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return _error("User not found.", 404)
    return jsonify({"user": user.to_dict()}), 200


@users_bp.put("/<int:user_id>")
@login_required
def update_user(user_id):
    if session["user_id"] != user_id:
        return _error("You can only update your own account.", 403)

    user = db.session.get(User, user_id)
    if not user:
        return _error("User not found.", 404)

    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    error = validate_username(username) or validate_email(email)
    if error:
        return _error(error)

    if password:
        password_error = validate_password(password)
        if password_error:
            return _error(password_error)

    if User.query.filter(
        ((User.username == username) | (User.email == email)) & (User.id != user_id)
    ).first():
        return _error("A user with that username or email already exists.", 409)

    user.username = username
    user.email = email
    if password:
        user.set_password(password)

    db.session.commit()

    return jsonify({"message": "User updated successfully.", "user": user.to_dict()}), 200


@users_bp.delete("/<int:user_id>")
@login_required
def delete_user(user_id):
    if session["user_id"] != user_id:
        return _error("You can only delete your own account.", 403)

    user = db.session.get(User, user_id)
    if not user:
        return _error("User not found.", 404)

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted successfully."}), 200
