import { useState } from "react";
import axios from "axios";

function UploadForm() {
  const [email, setEmail] = useState("");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !image) return alert("Please fill all fields");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("image", image);

    try {
      const res = await axios.post("http://localhost:5000/process", formData, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      setResult(url);
    } catch (err) {
      alert("Error: " + err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-96">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Remove Ink
        </button>
      </form>

      {result && (
        <div className="mt-4">
          <h2 className="font-semibold">Result:</h2>
          <img src={result} alt="Processed" className="mt-2 rounded shadow" />
        </div>
      )}
    </div>
  );
}

export default UploadForm;
