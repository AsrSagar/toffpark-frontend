import React from "react";

const AssociateLogos = () => {
    return (
        <aside className="section lite-background">
            <div className="section-associate-logo">
                <div className="container">
                <div className="associate-logo-section associate-logo-col-5">
                    <div
                    className="section-carousel-enabled byapr-carousel"
                    data-slick='{
                        "slidesToShow": 5,
                        "dots": false,
                        "prevArrow": "<span data-role=\"none\" class=\"slick-prev\" tabindex=\"0\"><i class=\"fa fa-angle-left\" aria-hidden=\"true\"></i></span>",
                        "nextArrow": "<span data-role=\"none\" class=\"slick-next\" tabindex=\"0\"><i class=\"fa fa-angle-right\" aria-hidden=\"true\"></i></span>",
                        "responsive": [
                        { "breakpoint": 1024, "settings": { "slidesToShow": 5 } },
                        { "breakpoint": 800, "settings": { "slidesToShow": 3 } },
                        { "breakpoint": 659, "settings": { "slidesToShow": 2 } },
                        { "breakpoint": 479, "settings": { "slidesToShow": 1 } }
                        ]
                    }'
                    >
                    <div className="associate-logo-item">
                        <a href="/">
                        <img src="/images/client-logo/client-new-1.png" alt="Associate Logo" />
                        </a>
                    </div>

                    <div className="associate-logo-item">
                        <a href="/">
                        <img src="/images/client-logo/client-new-2.png" alt="Associate Logo" />
                        </a>
                    </div>

                    <div className="associate-logo-item">
                        <a href="/">
                        <img src="/images/client-logo/client-new-3.png" alt="Associate Logo" />
                        </a>
                    </div>

                    <div className="associate-logo-item">
                        <a href="/">
                        <img src="/images/client-logo/client-new-4.png" alt="Associate Logo" />
                        </a>
                    </div>

                    <div className="associate-logo-item">
                        <a href="/">
                        <img src="/images/client-logo/client-new-5.png" alt="Associate Logo" />
                        </a>
                    </div>

                    <div className="associate-logo-item">
                        <a href="/">
                        <img src="/images/client-logo/client-new-6.png" alt="Associate Logo" />
                        </a>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        </aside>
    );
};  

export default AssociateLogos;