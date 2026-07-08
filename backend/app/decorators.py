from functools import wraps

from flask import jsonify, session


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("user_id"):
            return jsonify({"error": "Authentication required."}), 401
        return view(*args, **kwargs)

    return wrapped
