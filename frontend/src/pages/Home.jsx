import UploadForm from "../components/UploadForm";
import PaymentButton from "../components/PaymentButton";

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-4">🖋️ InkAway</h1>
      <p className="mb-6 text-gray-600">Remove ink marks from your documents instantly</p>
      
      <UploadForm />
      <PaymentButton />
    </div>
  );
}

export default Home;
