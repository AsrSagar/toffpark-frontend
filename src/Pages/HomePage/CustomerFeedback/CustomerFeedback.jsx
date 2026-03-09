import React, { useState } from "react";
import "./CustomerFeedback.css";

const CustomerFeedback = () => {

    const [playVideo, setPlayVideo] = useState(false);

    return (
        <section className="customer-feedback-section">

            <div className="feedback-container">

                <h2 className="feedback-title">
                    CUSTOMERS FEEDBACK
                </h2>

                <p className="feedback-desc">
                    We're thrilled that you were satisfied with our products and services.
                    Your feedback is appreciated, and inspiration to us!
                </p>

                <div className="video-wrapper">

                    {!playVideo ? (

                        <div 
                            className="video-box"
                            onClick={() => setPlayVideo(true)}
                        >

                            <img
                                src="/images/testimonials/Thumbnail-OVC-Nadia-2.jpg"
                                alt="Customer Feedback"
                                className="video-thumb"
                            />

                            <div className="play-btn">
                                <div className="play-icon"></div>
                            </div>

                        </div>

                    ) : (

                        <iframe
                            src="https://www.youtube.com/embed/Weh-dTfljgA?autoplay=1"
                            title="Customer Feedback"
                            frameBorder="0"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            className="video-iframe"
                        ></iframe>

                    )}

                </div>

            </div>

        </section>
    );
};

export default CustomerFeedback;