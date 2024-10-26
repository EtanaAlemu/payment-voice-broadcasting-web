import React, { useState } from "react";
import axios from "axios";
import "./App.css";

// Modal Component
const Modal = ({ message, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

// Loading Spinner Component
const Spinner = () => (
  <div className="spinner-overlay">
    <div className="spinner"></div>
  </div>
);

function App() {
  const [amount, setAmount] = useState("0.00");
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Extract `userid` from the URL query string
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("userid");

  const handlePayClick = async () => {
    const notificationMessage = `You have received ${amount} Birr`;
    setIsLoading(true); // Start loading spinner

    try {
      // Send POST request to notify API endpoint
      const response = await axios.post(
        "https://payment-voice-broadcasting-backend.vercel.app/api/notify",
        {
          userId,
          message: notificationMessage,
        },
        {
          timeout: 10000, // 30 seconds timeout
        }
      );

      if (response.status === 200) {
        setModalMessage("Payment Successful! Notification sent.");
      } else {
        setModalMessage("Payment failed. Unable to send notification.");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        // If the server returned an error response, show the error message from the response
        setModalMessage(`Error: ${error.response.data.message}`);
      } else if (error.message === "Network Error") {
        // Handle network error separately if needed
        setModalMessage("Network Error. Please check your connection.");
      } else if (error.code === "ECONNABORTED") {
        // Handle timeout error
        setModalMessage("Request timed out. Please try again.");
      } else {
        // Default fallback error message
        setModalMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false); // Stop loading spinner after the request finishes
      setIsModalOpen(true); // Open the modal with the message
    }
  };

  const handleAmountChange = (value) => {
    setAmount((prevAmount) => {
      if (prevAmount === "0.00" && value !== ".") {
        return value;
      }

      if (value === "." && prevAmount.includes(".")) {
        return prevAmount;
      }

      if (prevAmount === "0.00" && value === ".") {
        return "0.";
      }

      const decimalIndex = prevAmount.indexOf(".");
      if (decimalIndex !== -1 && prevAmount.length - decimalIndex > 2) {
        return prevAmount;
      }

      return prevAmount + value;
    });
  };

  const handleClear = () => {
    setAmount("0.00");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  return (
    <div className="App">
      <div className="amount">
        <h3>Amount</h3>
        <p>{amount} Birr</p>
      </div>
      <div className="keypad">
        {[...Array(9)].map((_, i) => (
          <button
            key={i}
            onClick={() => handleAmountChange((i + 1).toString())}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={() => handleAmountChange(".")}>.</button>
        <button onClick={() => handleAmountChange("0")}>0</button>
        <button className="clear-button" onClick={handleClear}>
          Clear
        </button>
        <button className="pay-button" onClick={handlePayClick}>
          Pay
        </button>
      </div>

      {/* Modal for Success/Error Message */}
      <Modal
        message={modalMessage}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Spinner for Loading */}
      {isLoading && <Spinner />}
    </div>
  );
}

export default App;
