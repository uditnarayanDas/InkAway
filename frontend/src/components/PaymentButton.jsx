import axios from "axios";

function PaymentButton() {
  const handlePayment = async () => {
    const res = await axios.post("http://localhost:5000/create_order", {
      amount: 100,
    });
    const order = res.data;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "InkAway",
      description: "Buy 10 credits",
      order_id: order.id,
      handler: async (response) => {
        await axios.post("http://localhost:5000/payment_success", {
          email: "test@example.com", // later get from auth
        });
        alert("Payment successful, credits added!");
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button
      onClick={handlePayment}
      className="mt-6 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
    >
      Buy Credits
    </button>
  );
}

export default PaymentButton;
