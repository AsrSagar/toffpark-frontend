import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import config from "../../config";


const AboutPage = () => {
    const API_URL = config.API_URL;
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);

        fetch(`${API_URL}/wp/v2/pages?slug=about-us`)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    setPageData(data[0]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching page:", err);
                setLoading(false);
            });
    }, [ API_URL ]);
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return (
        <>
        <div id="custom-header">
            <div className="custom-header-content">
            <div className="container">
                <div id="breadcrumb">
                <div className="breadcrumbs breadcrumb-trail">
                    <ul className="trail-items">
                    <li className="trail-item trail-begin">
                        <Link to="/">
                            <span>Home</span>
                        </Link>
                    </li>
                    <li className="trail-item trail-end">
                        <span>About Us</span>
                    </li>
                    </ul>
                </div>
                </div>
            </div>
            </div>
        </div>
        <aside className="section no-padding static-page-section">
            <div className="container">
                <div className="content-block">
                    <div className="privacy-policy">
                        {loading ? (
                            <p>Loading...</p>
                        ) : pageData ? (
                            <>
                                <h2>{pageData.title.rendered}</h2>
                                <div 
                                    dangerouslySetInnerHTML={{ __html: pageData.content.rendered }} 
                                />
                            </>
                        ) : (
                            <p>Page not found.</p>
                        )}
                    </div>
                </div>
            </div>
        </aside>
        </>
    );
};  

export default AboutPage;