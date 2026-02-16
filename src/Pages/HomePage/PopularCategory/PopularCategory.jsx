import React from "react";

export const PopularCategory = () => {
    return (
        <aside className="section no-padding">
            <div className="section-product-categorys">
                <div className="container">
                <div className="section-title-wrap">
                    <h2 className="section-title">Popular Category</h2>
                </div>
                <div className="inner-wrapper">
                    <div
                    className="product-categorys-inner-wrapper section-carousel-enabled byapr-carousel"
                    data-slick='{"slidesToShow":4,"dots":false,"prevArrow":"<span data-role=\"none\" class=\"slick-prev\" tabindex=\"0\"><i class=\"fa fa-angle-left\" aria-hidden=\"true\"></i></span>","nextArrow":"<span data-role=\"none\" class=\"slick-next\" tabindex=\"0\"><i class=\"fa fa-angle-right\" aria-hidden=\"true\"></i></span>","responsive":[{"breakpoint":1024,"settings":{"slidesToShow":4}},{"breakpoint":800,"settings":{"slidesToShow":3}},{"breakpoint":659,"settings":{"slidesToShow":2}},{"breakpoint":479,"settings":{"slidesToShow":1}}]}'
                    >
                    <div className="product-item col-grid-3">
                        <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                        <div className="product-thumb zoom-effect">
                            <a className="thumbnail" href="/">
                            <img alt="category" src="images/shop/cat1.jpg" />
                            </a>
                        </div>
                        <h3 className="category-title">
                            <a href="/" title="title">
                            Women's Winter <span className="count">14</span>
                            </a>
                        </h3>
                        </div>
                    </div>

                    <div className="product-item col-grid-3">
                        <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                        <div className="product-thumb zoom-effect">
                            <a className="thumbnail" href="/">
                            <img alt="category" src="images/shop/cat2.jpg" />
                            </a>
                        </div>
                        <h3 className="category-title">
                            <a href="/" title="title">
                            Summer Fashion <span className="count">12</span>
                            </a>
                        </h3>
                        </div>
                    </div>

                    <div className="product-item col-grid-3">
                        <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                        <div className="product-thumb zoom-effect">
                            <a className="thumbnail" href="/">
                            <img alt="category" src="images/shop/cat3.jpg" />
                            </a>
                        </div>
                        <h3 className="category-title">
                            <a href="/" title="title">
                            Men's Fashion <span className="count">20</span>
                            </a>
                        </h3>
                        </div>
                    </div>

                    <div className="product-item col-grid-3">
                        <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                        <div className="product-thumb zoom-effect">
                            <a className="thumbnail" href="/">
                            <img alt="category" src="images/shop/cat4.jpg" />
                            </a>
                        </div>
                        <h3 className="category-title">
                            <a href="/" title="title">
                            Men's Jeans <span className="count">14</span>
                            </a>
                        </h3>
                        </div>
                    </div>

                    <div className="product-item col-grid-3">
                        <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                        <div className="product-thumb zoom-effect">
                            <a className="thumbnail" href="/">
                            <img alt="category" src="images/shop/cat5.jpg" />
                            </a>
                        </div>
                        <h3 className="category-title">
                            <a href="/" title="title">
                            Women's <span className="count">14</span>
                            </a>
                        </h3>
                        </div>
                    </div>

                    <div className="product-item col-grid-3">
                        <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                        <div className="product-thumb zoom-effect">
                            <a className="thumbnail" href="/">
                            <img alt="category" src="images/shop/cat6.jpg" />
                            </a>
                        </div>
                        <h3 className="category-title">
                            <a href="/" title="title">
                            Bags <span className="count">14</span>
                            </a>
                        </h3>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        </aside>
    );
};

export default PopularCategory;