import re

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MIN_PASSWORD_LENGTH = 8
MIN_USERNAME_LENGTH = 3


def validate_username(username):
    if not username or len(username) < MIN_USERNAME_LENGTH:
        return f"Username must be at least {MIN_USERNAME_LENGTH} characters long."
    return None


def validate_email(email):
    if not email or not EMAIL_RE.match(email):
        return "A valid email address is required."
    return None


def validate_password(password):
    if not password or len(password) < MIN_PASSWORD_LENGTH:
        return f"Password must be at least {MIN_PASSWORD_LENGTH} characters long."
    return None
