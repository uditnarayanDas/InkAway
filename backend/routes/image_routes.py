from flask import Blueprint, request, jsonify, send_file
from utils.huggingface import remove_ink
from models import get_user, update_credits, log_history
import tempfile

image_bp = Blueprint("image", __name__)

@image_bp.route("/process", methods=["POST"])
def process_image():
    email = request.form.get("email")
    image = request.files.get("image")

    user = get_user(email)
    if not user or user["credits"] <= 0:
        return jsonify({"error": "No credits left. Please buy more."}), 403

    # Process via Hugging Face
    output = remove_ink(image)

    # Save temp output
    temp = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
    temp.write(output)
    temp.flush()

    # Deduct credits & log history
    update_credits(email, -1)
    log_history(email, temp.name)

    return send_file(temp.name, mimetype="image/png")
