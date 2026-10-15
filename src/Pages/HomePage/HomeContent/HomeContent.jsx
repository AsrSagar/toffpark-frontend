import React, { useEffect, useState } from "react";
import config from "../../../config";
import './HomeContent.css';

const HomeContent = () => {
    const API_URL = config.API_URL;
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);

        fetch(`${API_URL}/wp/v2/pages?slug=home`)
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
        <aside className="section no-padding">
            <div class="container home-content-section">
                {loading ? (
                    <p>Loading...</p>
                ) : pageData ? (
                    <>
                        <div 
                            dangerouslySetInnerHTML={{ __html: pageData.content.rendered }} 
                        />
                    </>
                ) : (
                    <p>Page not found.</p>
                )}
            </div>
        </aside>
    );
};

export default HomeContent;