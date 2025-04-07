import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spinner, TextInput, Label, Radio, Textarea, Alert } from "flowbite-react";
import { useSelector } from "react-redux";

export default function DonateCase() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  
  const [donationCase, setDonationCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    amount: "",
    customAmount: "",
    donorName: "",
    donorEmail: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchDonationCase = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/donation/case/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch donation case");
        }
        const data = await res.json();
        setDonationCase(data);
        
        // Set the first amount option as default
        if (data.amountOptions && data.amountOptions.length > 0) {
          setFormData(prev => ({
            ...prev,
            amount: data.amountOptions[0].toString()
          }));
        }
        
        // Pre-fill user info if logged in
        if (currentUser) {
          setFormData(prev => ({
            ...prev,
            donorName: currentUser.username || "",
            donorEmail: currentUser.email || "",
          }));
        }
        
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchDonationCase();
  }, [id, currentUser]);

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    setFormData({
      ...formData,
      [name || id]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Determine the actual amount to donate
      const donationAmount = formData.amount === "custom" 
        ? parseFloat(formData.customAmount) 
        : parseFloat(formData.amount);
      
      // Validate the amount
      if (isNaN(donationAmount) || donationAmount <= 0) {
        throw new Error("Please enter a valid donation amount");
      }
      
      // Prepare request body
      const requestBody = {
        donationCaseId: id,
        amount: donationAmount,
        donorName: formData.donorName || "Anonymous",
        donorEmail: formData.donorEmail || "",
        message: formData.message || "",
      };
      
      // Make API request
      const res = await fetch("/api/donation/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Something went wrong with your donation");
      }
      
      // Successful donation
      setSuccessMessage("Thank you for your donation! Your contribution helps make a difference.");
      
      // Reset form
      setFormData({
        amount: donationCase.amountOptions[0].toString(),
        customAmount: "",
        donorName: currentUser ? currentUser.username : "",
        donorEmail: currentUser ? currentUser.email : "",
        message: "",
      });
      
      // Redirect to success page or show success message
      setTimeout(() => {
        navigate("/donate/success", { state: { donationData: data, caseTitle: donationCase.title } });
      }, 2000);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Format amount with commas and two decimal places
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate progress percentage
  const getProgressPercentage = (raised, goal) => {
    if (!goal) return 0;
    const percentage = (raised / goal) * 100;
    return Math.min(percentage, 100).toFixed(0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-3 py-8">
        <Alert color="failure" className="mb-4">
          {error}
        </Alert>
        <Button onClick={() => navigate("/donate")}>
          Back to Donations
        </Button>
      </div>
    );
  }

  if (!donationCase) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-3 py-8">
        <Alert color="failure" className="mb-4">
          Donation case not found
        </Alert>
        <Button onClick={() => navigate("/donate")}>
          Back to Donations
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-3 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donation Case Details */}
        <div>
          {donationCase.image && (
            <img
              src={donationCase.image}
              alt={donationCase.title}
              className="w-full h-[300px] object-cover rounded-lg mb-6"
            />
          )}
          
          <h1 className="text-3xl font-semibold mb-4">{donationCase.title}</h1>
          
          <div className="text-gray-600 dark:text-gray-400 mb-6 whitespace-pre-line">
            {donationCase.description}
          </div>
          
          {donationCase.goalAmount && (
            <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-lg font-medium">
                  {formatAmount(donationCase.raisedAmount)} raised
                </span>
                <span className="text-lg font-medium">
                  Goal: {formatAmount(donationCase.goalAmount)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full"
                  style={{ width: `${getProgressPercentage(donationCase.raisedAmount, donationCase.goalAmount)}%` }}
                ></div>
              </div>
              <div className="mt-2 text-right">
                {getProgressPercentage(donationCase.raisedAmount, donationCase.goalAmount)}% of goal
              </div>
            </div>
          )}
        </div>
        
        {/* Donation Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Make a Donation</h2>
          
          {successMessage && (
            <Alert color="success" className="mb-4">
              {successMessage}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="amount" value="Select Donation Amount" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {donationCase.amountOptions.map((amount) => (
                  <div key={amount} className="flex items-center">
                    <Radio
                      id={`amount-${amount}`}
                      name="amount"
                      value={amount.toString()}
                      checked={formData.amount === amount.toString()}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <Label htmlFor={`amount-${amount}`}>{formatAmount(amount)}</Label>
                  </div>
                ))}
                <div className="flex items-center col-span-2">
                  <Radio
                    id="amount-custom"
                    name="amount"
                    value="custom"
                    checked={formData.amount === "custom"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <Label htmlFor="amount-custom">Custom Amount</Label>
                </div>
              </div>
              
              {formData.amount === "custom" && (
                <div className="mt-2">
                  <TextInput
                    id="customAmount"
                    name="customAmount"
                    type="number"
                    placeholder="Enter amount"
                    value={formData.customAmount}
                    onChange={handleChange}
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              )}
            </div>
            
            <div>
              <div className="mb-2 block">
                <Label htmlFor="donorName" value="Your Name (Optional)" />
              </div>
              <TextInput
                id="donorName"
                name="donorName"
                placeholder="Your name or 'Anonymous'"
                value={formData.donorName}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <div className="mb-2 block">
                <Label htmlFor="donorEmail" value="Email (Optional)" />
              </div>
              <TextInput
                id="donorEmail"
                name="donorEmail"
                type="email"
                placeholder="For donation receipt"
                value={formData.donorEmail}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <div className="mb-2 block">
                <Label htmlFor="message" value="Message (Optional)" />
              </div>
              <Textarea
                id="message"
                name="message"
                placeholder="Leave a message with your donation"
                value={formData.message}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <Button
              type="submit"
              gradientDuoTone="purpleToBlue"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                "Donate Now"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 