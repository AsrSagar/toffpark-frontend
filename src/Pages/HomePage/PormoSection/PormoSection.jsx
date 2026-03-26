import React from "react";
import "./PormoSection.css";

export const PormoSection = () => {
    return (
        <aside className="section section-pormo">
            <div className="container">
                <div className="inner-wrapper">
                    <div className="col-grid-3">
                        <div className="pormo-item">
                            <h3 className="pormo-title">Premium Quality</h3>
                        </div>
                    </div>
                    <div className="col-grid-3">
                        <div className="pormo-item">
                            <h3 className="pormo-title">24 Hours Delivery*</h3>
                        </div>
                    </div>
                    <div className="col-grid-3">
                        <div className="pormo-item">
                            <h3 className="pormo-title">Free Exchange</h3>
                        </div>
                    </div>
                    <div className="col-grid-3">
                        <div className="pormo-item">
                            <h3 className="pormo-title">Home Delivery</h3>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default PormoSection;