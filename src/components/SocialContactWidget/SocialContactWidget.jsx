import React, { useState } from 'react';
import { FaFacebookMessenger, FaWhatsapp, FaPhoneAlt, FaTimes } from 'react-icons/fa';
import { BiChevronUp } from 'react-icons/bi';
import './SocialContactWidget.css'; // সিএসএস ফাইলটি ইমপোর্ট করলাম

const SocialContactWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="social-widget-container">
      
      {/* Social Options Panel */}
      <div className={`social-options ${isOpen ? 'open' : ''}`}>
        {/* Messenger */}
        <a 
          href="https://www.facebook.com/orlazzofficial/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="social-btn btn-messenger"
          title="Messenger"
        >
          <FaFacebookMessenger size={24} />
        </a>

        {/* WhatsApp */}
        <a 
          href="https://api.whatsapp.com/send/?phone=8801811877477" 
          target="_blank" 
          rel="noopener noreferrer"
          className="social-btn btn-whatsapp"
          title="WhatsApp"
        >
          <FaWhatsapp size={24} />
        </a>

        {/* Phone Call */}
        <a 
          href="tel:+8801811877477" 
          className="social-btn btn-phone"
          title="Call Us"
        >
          <FaPhoneAlt size={20} />
        </a>
      </div>

      {/* Main Toggle Button */}
      <button onClick={toggleMenu} className="social-toggle-btn">
        {isOpen ? (
          <div className="social-btn btn-close">
            <FaTimes size={18} />
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <img 
              src="https://backend.orlazz.com/wp-content/uploads/2026/08/Chat-Image-3.jpeg" // এখানে আপনার এজেন্টের ইমেজ পাথ বসাবেন
              alt="Support" 
              className="agent-img"
            />
            <span className="online-dot"></span>
          </div>
        )}
      </button>
    </div>
  );
};

export default SocialContactWidget;