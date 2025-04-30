import { Button, Textarea, Label } from 'flowbite-react';
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import CustomModal from "./CustomModal";
import CustomAlert from "./CustomAlert";

export default function Hero() {
  const {currentUser} = useSelector((state) => state.user);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [showModal, setShowModal] = useState(false);
  const [publisherReason, setPublisherReason] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [successToast, setSuccessToast] = useState({ show: false, message: "" });
  
  // Clear validation error after 3 seconds
  useEffect(() => {
    if (validationError) {
      const timer = setTimeout(() => {
        setValidationError(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [validationError]);
  
  // Auto-hide success toast after 5 seconds
  useEffect(() => {
    if (successToast.show) {
      const timer = setTimeout(() => {
        setSuccessToast({ show: false, message: "" });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successToast.show]);

  const displayAlert = (message, type = "info") => {
    if (type === "success") {
      setSuccessToast({ show: true, message });
      return;
    }
    
    // For warnings and info, use the top alert
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
    <div className="bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white">
      {/* Top warning/info alerts */}
      {showAlert && (
        <div className="absolute top-4 left-0 right-0 mx-auto w-full max-w-md z-50">
          <CustomAlert
            message={<span className="font-medium">{alertMessage}</span>}
            type={alertType === "warning" ? "warning" : "info"}
          />
        </div>
      )}
      
      {/* Bottom success toast */}
      {successToast.show && (
        <div className="fixed bottom-4 left-0 right-0 mx-auto w-[90%] sm:w-[85%] md:w-[70%] lg:w-[60%] max-w-md z-50 animate-fade-in-up">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-green-500">
            <CustomAlert
              message={<span className="font-medium">{successToast.message}</span>}
              type="success"
              className="shadow-md border-l-8 m-0 animate-none rounded-r-lg"
            />
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-1">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Share Your Story, Make an Impact.
              <br className="hidden sm:block" />
              
            </h1>
            <p className="text-base sm:text-lg mb-6 sm:mb-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0">
              Join our diverse community where every voice matters. Whether you&apos;re passionate about art,
              supporting causes, sharing knowledge, or making a difference - this is your platform to
              connect, inspire, and create meaningful change.
            </p>
            <div className="flex justify-center lg:justify-start">
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
          <div className="hidden lg:block flex-1 w-full max-w-lg">
            <img
            loading="eager"
              src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Modern creative workspace"
              className="w-full h-[500px] object-cover rounded-lg shadow-lg mx-auto transition-transform duration-300 brightness-[0.95] contrast-[1.05]"
            />
          </div>
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
            <CustomAlert message={validationError} type="warning" />
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
              className={`w-full ${validationError ? 'border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500' : ''}`}
            />
          </div>
        </div>
      </CustomModal>
    </div>
  );
} 