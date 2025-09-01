from flask import Flask
from routes.user_routes import user_bp
from routes.payment_routes import payment_bp
from routes.image_routes import image_bp

app = Flask(__name__)

# Register routes
app.register_blueprint(user_bp, url_prefix="/user")
app.register_blueprint(payment_bp, url_prefix="/payment")
app.register_blueprint(image_bp, url_prefix="/image")

if __name__ == "__main__":
    app.run(debug=True)
