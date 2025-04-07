import { useEffect } from "react";
import { useLocation, useNavigate} from "react-router-dom";
import { Button } from "flowbite-react";
import { HiCheckCircle } from "react-icons/hi";

export default function DonateSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const donationData = location.state?.donationData;
  const caseTitle = location.state?.caseTitle;

  useEffect(() => {
    // If user directly navigates to this page without donation data, redirect to donations
    if (!donationData) {
      navigate("/donate");
    }
  }, [donationData, navigate]);

  // Format amount with commas and two decimal places
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!donationData) {
    return null; // This will redirect due to the useEffect
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-3 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <HiCheckCircle className="w-24 h-24 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Thank You for Your Donation!</h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          Your generous contribution of {formatAmount(donationData.amount)} to{" "}
          <span className="font-medium">{caseTitle}</span> will help make a difference.
        </p>

        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Donation Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Amount</p>
              <p className="font-medium">{formatAmount(donationData.amount)}</p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Date</p>
              <p className="font-medium">
                {new Date(donationData.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Donor</p>
              <p className="font-medium">{donationData.donorName}</p>
            </div>
            
            {donationData.donorEmail && (
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Email</p>
                <p className="font-medium">{donationData.donorEmail}</p>
              </div>
            )}
            
            {donationData.status && (
              <div className="col-span-2">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Status</p>
                <p className="font-medium capitalize">{donationData.status}</p>
              </div>
            )}
            
            {donationData.message && (
              <div className="col-span-2">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Message</p>
                <p className="font-medium">{donationData.message}</p>
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          A confirmation email will be sent to you shortly with the details of your donation.
          If you have any questions, please contact our support team.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            gradientDuoTone="purpleToBlue" 
            onClick={() => navigate("/")}
          >
            Return to Home
          </Button>
          
          <Button 
            outline
            gradientDuoTone="purpleToBlue"
            onClick={() => navigate("/donate")}
          >
            View More Causes
          </Button>
        </div>
      </div>
    </div>
  );
} 