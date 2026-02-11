import React from "react";

const Newsletter = () => {
    return (
        <aside className="section lite-background minimal-padding boxed-width-section">
            <div className="section-news-letter">
                <div className="container">
                <div className="col-grid-6 newsletter-text">
                    <span className="newsletter-icon pull-left">
                    <i className="icon-envelope"></i>
                    </span>
                    <div className="news-letter-title">
                    <h2>Subscribe Newsletter</h2>
                    <p>Enter your email and subscribe latest offers</p>
                    </div>
                </div>
                <div className="col-grid-6">
                    <div className="news-letter-wrapper">
                    <form className="news-letter-form">
                        <input
                        className="news-letter-email"
                        type="email"
                        name="ne"
                        placeholder="Enter your email address"
                        />
                        <input
                        className="news-letter-submit"
                        type="submit"
                        value="Subscribe"
                        />
                    </form>
                    </div>
                </div>
                </div>
            </div>
        </aside>
    )
}

export default Newsletter