import { Button, Alert } from "flowbite-react";
import { useSelector } from "react-redux";
import { useState } from "react";
import { HiInformationCircle } from "react-icons/hi";

export default function CallToAction() {
  const {currentUser} = useSelector((state) => state.user);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");

  const displayAlert = (message, type = "info") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    
    // Auto-hide alert after 5 seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const handleRequestPublisher = async () => {
    if(!currentUser) {
      displayAlert("Please sign in to request publisher access.", "warning");
      return;
    }
    
    // Check if user is an admin
    if(currentUser.isAdmin) {
      displayAlert("Administrators already have full access to create posts.", "info");
      return;
    }
    
    // Check if user is already a publisher
    if(currentUser.isPublisher) {
      displayAlert("You are already a publisher!", "info");
      return;
    }
    
    try {
      const res = await fetch('/api/user/request-publisher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ userId: currentUser._id }),
      });

      if (res.ok) {
        displayAlert("Your request to become a publisher has been submitted.", "success");
      } else {
        const data = await res.json();
        displayAlert(data.message || "Failed to submit request. Please try again later.", "failure");
      }
    } catch (error) {
      console.error("Error:", error);
      displayAlert("An error occurred. Please try again later.", "failure");
    }
  };

  const getButtonText = () => {
    if (!currentUser) return "Become a Publisher";
    if (currentUser.isAdmin) return "Admin Access";
    if (currentUser.isPublisher) return "You are a Publisher";
    return "Become a Publisher";
  };

  const isButtonDisabled = () => {
    return currentUser && (currentUser.isAdmin || currentUser.isPublisher);
  };

  return (
    <div className="relative border border-teal-500 rounded-tl-3xl rounded-br-3xl overflow-hidden">
      {showAlert && (
        <div className="absolute top-4 left-0 right-0 mx-auto w-full max-w-md z-50">
          <Alert
            color={alertType}
            onDismiss={() => setShowAlert(false)}
            icon={HiInformationCircle}
          >
            <span className="font-medium">{alertMessage}</span>
          </Alert>
        </div>
      )}
      <div 
        className="absolute inset-0 bg-[url('https://womenfitnessmag.com/wp-content/uploads/2022/08/How-To-Reconnect-With-Your-.jpg')] bg-cover bg-center"
        style={{ filter: 'brightness(0.7)' }}
      ></div>
      <div className="relative min-h-[400px] flex flex-col justify-center items-center text-center p-8 gap-4">
        <h2 className="text-2xl font-bold text-white">
          SHARE YOUR VOICE WITH THE WORLD
        </h2>
        <p className="text-white my-2 max-w-xl">
          Join our community of writers and share your stories, insights, and perspectives. Start publishing your articles today and make an impact.
        </p>
        <Button 
          gradientDuoTone="pinkToOrange" 
          className="rounded-tl-xl rounded-bl-none" 
          onClick={handleRequestPublisher}
          disabled={isButtonDisabled()}
        >
          {getButtonText()}
        </Button>
      </div>
    </div>
  )
}
