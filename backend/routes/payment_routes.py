from flask import Blueprint, request, jsonify
import razorpay
from config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
from models import add_user, update_credits, log_payment

payment_bp = Blueprint("payment", __name__)
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

@payment_bp.route("/create_order", methods=["POST"])
def create_order():
    data = request.json
    amount = data.get("amount")
    order = razorpay_client.order.create(dict(amount=amount*100, currency="INR", payment_capture="1"))
    return jsonify(order)

@payment_bp.route("/success", methods=["POST"])
def payment_success():
    data = request.json
    email = data["email"]
    amount = data["amount"]

    add_user(email)
    update_credits(email, 10)
    log_payment(email, amount, "success")

    return jsonify({"message": "Payment successful, credits added!"})
