import React from "react";

const InstagramSection = () => {
    return (
        <article className="section">
            <div className="instagram-section">
                <div className="container">
                    <div className="section-title-wrap">
                        <h2 className="section-title">Follow Us</h2>
                    </div>
                    <div className="instagram-inner-wrapper">
                        <div
                        className="iteam-col-6 section-carousel-enabled byapr-carousel"
                        data-slick='{"slidesToShow":5,"dots":false,"prevArrow":"<span data-role=\"none\" class=\"slick-prev\" tabindex=\"0\"><i class=\"fa fa-angle-left\" aria-hidden=\"true\"></i></span>","nextArrow":"<span data-role=\"none\" class=\"slick-next\" tabindex=\"0\"><i class=\"fa fa-angle-right\" aria-hidden=\"true\"></i></span>","responsive":[{"breakpoint":1024,"settings":{"slidesToShow":5}},{"breakpoint":800,"settings":{"slidesToShow":3}},{"breakpoint":659,"settings":{"slidesToShow":2}},{"breakpoint":479,"settings":{"slidesToShow":1}}]}'
                        >
                        {[1,2,3,4,5,6].map((num) => (
                            <div key={num} className="insta-item">
                                <a href="/"><img alt={`post-${num}`} src={`images/instagram/post-${num}.jpg`} /></a>
                                <div className="instagram-hvr-content">
                                    <span className="tottallikes"><i className="fa fa-heart"></i>0</span>
                                    <span className="totalcomments"><i className="fa fa-comments"></i>0</span>
                                </div>
                            </div>
                        ))}
                        </div>
                        <div className="instagram-caption">
                            <div className="instagram-cap-wrapper">
                                <a href="/" className="custom-button custom-white">Follow Us</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
};  

export default InstagramSection;