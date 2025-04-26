import { Button, Alert, Textarea, Label } from "flowbite-react";
import { useSelector } from "react-redux";
import { useState } from "react";
import { HiInformationCircle, HiExclamation } from "react-icons/hi";
import CustomModal from "./CustomModal";

export default function CallToAction() {
  const {currentUser} = useSelector((state) => state.user);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [showModal, setShowModal] = useState(false);
  const [publisherReason, setPublisherReason] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const displayAlert = (message, type = "info") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    
    // Auto-hide alert after 5 seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const handleOpenRequestModal = () => {
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

    setValidationError(""); // Clear any previous errors
    setShowModal(true);
  };

  const handleRequestPublisher = async () => {
    if (publisherReason.trim().length < 10) {
      setValidationError("Please provide a more detailed explanation (at least 10 characters).");
      return;
    }
    
    // Clear validation error if we pass validation
    setValidationError("");
    
    try {
      setSubmitLoading(true);
      const res = await fetch('/api/user/request-publisher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ 
          userId: currentUser._id,
          reason: publisherReason 
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setPublisherReason("");
        displayAlert("Your request to become a publisher has been submitted.", "success");
      } else {
        const data = await res.json();
        setValidationError(data.message || "Failed to submit request. Please try again later.");
      }
    } catch (error) {
      console.error("Error:", error);
      setValidationError("An error occurred. Please try again later.");
    } finally {
      setSubmitLoading(false);
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

  const modalFooter = (
    <div className="flex justify-center gap-4 w-full">
      <Button 
        gradientDuoTone="pinkToOrange"
        onClick={handleRequestPublisher}
        disabled={submitLoading}
      >
        {submitLoading ? "Submitting..." : "Submit Request"}
      </Button>
      <Button 
        color="gray"
        onClick={() => setShowModal(false)}
        disabled={submitLoading}
      >
        Cancel
      </Button>
    </div>
  );

  return (
    <>
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
            onClick={handleOpenRequestModal}
            disabled={isButtonDisabled()}
          >
            {getButtonText()}
          </Button>
        </div>
      </div>

      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Become a Publisher on Glim"
        maxWidth="md"
        footer={modalFooter}
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Tell us why you&apos;d like to become a publisher on Glim. What unique perspectives or content would you bring to our community?
          </p>
          
          {validationError && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <div className="flex items-center">
                <HiExclamation className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-yellow-700 font-medium">
                  {validationError}
                </p>
              </div>
            </div>
          )}
          
          <div>
            <div className="mb-2 block">
              <Label htmlFor="publisherReason" value="Your motivation:" />
            </div>
            <Textarea
              id="publisherReason"
              placeholder="Why do you think you should be a publisher on Glim?"
              rows={5}
              value={publisherReason}
              onChange={(e) => setPublisherReason(e.target.value)}
              required
              className={`w-full ${validationError ? 'border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500' : ''}`}
            />
          </div>
        </div>
      </CustomModal>
    </>
  )
}
