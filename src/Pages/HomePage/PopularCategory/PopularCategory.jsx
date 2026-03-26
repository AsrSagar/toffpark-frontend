import React from "react";
import Slider from "react-slick";
import "./PopularCategory.css";

const PopularCategory = () => {

    const PrevArrow = ({ onClick }) => (
        <span className="slick-prev" onClick={onClick}>
            <i className="fa fa-angle-left" aria-hidden="true"></i>
        </span>
    );

    const NextArrow = ({ onClick }) => (
        <span className="slick-next" onClick={onClick}>
            <i className="fa fa-angle-right" aria-hidden="true"></i>
        </span>
    );

    const settings = {
        slidesToShow: 4,
        dots: false,
        arrows: true,
        infinite: true,

        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,

        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 4 } },
            { breakpoint: 800, settings: { slidesToShow: 3 } },
            { breakpoint: 659, settings: { slidesToShow: 2 } },
            { breakpoint: 479, settings: { slidesToShow: 1 } },
        ]
    };

    return (
        <aside className="section no-padding">
            <div className="section-product-categorys">
                <div className="container">
                    <div className="section-title-wrap">
                        <h2 className="section-title">
                            Explore By Categories
                        </h2>
                    </div>
                    <div className="inner-wrapper">
                        <Slider 
                            {...settings}
                            className="product-categorys-inner-wrapper section-carousel-enabled byapr-carousel"
                        >
                            <div className="product-item col-grid-3">
                                <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                                    <div className="product-thumb zoom-effect">
                                        <a className="thumbnail" href="/">
                                            <img alt="category" src="images/shop/cat1.jpg" />
                                        </a>
                                    </div>
                                    <h3 className="category-title">
                                        <a href="/">
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
                                        <a href="/">
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
                                        <a href="/">
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
                                        <a href="/">
                                            Men's Jeans <span className="count">14</span>
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
                                        <a href="/">
                                            Men's Jeans <span className="count">14</span>
                                        </a>
                                    </h3>
                                </div>
                            </div>
                        </Slider>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default PopularCategory;