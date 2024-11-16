  import React from 'react';
  import { useNavigate } from 'react-router-dom'; // Import useNavigate
  import './scroll.css'; // Include the CSS for the footer

  const Scroll = () => {
    const navigate = useNavigate(); // Initialize useNavigate

    const handleChatbotClick = () => {
      console.log("Chatbot button clicked");
      // Add functionality for the chatbot button here
    };

    const handleAboutClick = () => {
      console.log("About button clicked");
      navigate('/about'); // Navigate to the About page
    };

    const handleFAQsClick = () => {
      console.log("FAQs button clicked");
      window.open('/FAQ.pdf', '_blank'); // Open FAQs.docx in a new tab
    };

    return (
      <div className="footer">
        <button className="footer-button" onClick={handleChatbotClick}>Chatbot</button>
        <button className="footer-button" onClick={handleAboutClick}>About</button>
        <button className="footer-button" onClick={handleFAQsClick}>FAQs</button>
      </div>
    );
  };

  export default Scroll;
