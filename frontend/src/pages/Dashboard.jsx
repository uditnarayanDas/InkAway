import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [user, setUser] = useState(null);
  const email = "test@example.com"; 

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/user/${email}`);
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  if (!user) return <div className="p-6">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">📊 Dashboard</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold">Welcome, {user.email}</h2>
        <p className="mt-2 text-gray-600">
          Remaining Credits: <span className="font-bold">{user.credits}</span>
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">💳 Payment History</h2>
        {user.payments.length > 0 ? (
          <ul className="space-y-2">
            {user.payments.map((p) => (
              <li
                key={p.id}
                className="flex justify-between items-center border-b py-2"
              >
                <span>Order #{p.id}</span>
                <span className="text-sm text-gray-500">{p.status}</span>
                <span className="font-semibold">₹{p.amount}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No payments yet.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
