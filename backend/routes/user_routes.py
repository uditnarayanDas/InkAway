from flask import Blueprint, jsonify
from models import get_user

user_bp = Blueprint("user", __name__)

@user_bp.route("/<email>", methods=["GET"])
def profile(email):
    user = get_user(email)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)
