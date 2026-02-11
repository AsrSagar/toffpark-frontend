import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { wcApi } from "../../api/woocommerce";
import { useCart } from "../../context/CartContext";
import BuyNowPopupCheckout from "../../components/BuyNowPopupCheckout/BuyNowPopupCheckout";
import config from "../../config";


const ProductDetailsPage = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [activeImage, setActiveImage] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingId, setLoadingId] = useState(null); 
    const [quantity, setQuantity] = useState(1); 
    const { addToCart, isInCart } = useCart();
    const API_URL = config.API_URL;

    useEffect(() => {
        wcApi.get("/products", { params: { slug } }).then((res) => {
        const p = res.data[0];
        setProduct(p);
        setActiveImage(p.images[0]?.src);
        setLoading(false);
        });
    }, [slug,]);

    const handleAddToCart = async (product) => {
    if (!isInCart(product.id)) {
        setLoadingId(product.id);
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            addToCart(product, quantity); 
        } finally {
            setLoadingId(null);
        }
    }
    };

    return (
    <>
        {loading || !product ? (
        <div>Loading...</div>
        ) : (
        <div className="product-single-page">
            <div id="custom-header">
                <div className="custom-header-content">
                    <div className="container">
                        <h1 className="page-title">{product.name}</h1>
                        <div id="breadcrumb">
                            <div  aria-label="Breadcrumbs" className="breadcrumbs breadcrumb-trail">
                                <ul className="trail-items">
                                <li className="trail-item trail-begin"><a href="/" rel="home"><span>Home</span></a></li>
                                <li className="trail-item"><span>Shop</span></li>
                                    <li className="trail-item trail-end"><span>{product.name}</span></li>
                                </ul>
                            </div> 
                        </div> 
                    </div>
                </div>
            </div>
            <div id="content" className="site-content global-layout-right-sidebar">
                <div className="container">
                    <div className="inner-wrapper">
                        <div id="primary" className="content-area">
                            <main id="main" className="site-main">
                                <div className="product-single">
                                    <div className="inner-wrapper">
                                        <div className="col-grid-6">
                                            <div className="single-thumb-detail">
                                                <div className="single-main-thumb">
                                                    <div className="single-thumb">
                                                        <span className="ribbon-rotated onsale">-16%</span>
                                                        <img src={activeImage} alt="product" />
                                                    </div>
                                                </div>
                                                <div className="pager-thumbnail">
                                                    {product.images.map((img) => (
                                                    <div
                                                        key={img.id}
                                                        className={`pager-thumb ${activeImage === img.src ? "active" : ""}`}
                                                        onClick={() => setActiveImage(img.src)}
                                                    >
                                                        <img src={img.src} alt="thumb" />
                                                    </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-grid-6">
                                            <div className="summary entry-summary">
                                                <div className="product-item-details">
                                                    <h2 className="product-title">
                                                    <a href="/">{product.name}</a>
                                                    </h2>

                                                    <div className="rating-wrapper clear-fix">
                                                    <div className="product-ratings">
                                                        {[1, 2, 3, 4, 5].map((i) => (
                                                        <span
                                                            key={i}
                                                            className={`star ${i <= 3 ? "active" : ""}`}
                                                        />
                                                        ))}
                                                    </div>

                                                    <ul className="info-links">
                                                        <li>
                                                        <a href="/">(3.5) 54 Ratings</a>
                                                        </li>
                                                        <li>
                                                        <a href="/">4 Reviews</a>
                                                        </li>
                                                    </ul>
                                                    </div>

                                                    <div
                                                        className="product-price-container"
                                                        dangerouslySetInnerHTML={{ __html: product.price_html }}
                                                    />
                                                </div>
                                                <div className="item-content">
                                                    <p>
                                                    Nam libero tempore, cum soluta nobis est eligendi optio
                                                    cumque nihil impedit quo minus id quod maxime placeat
                                                    facere possimus.
                                                    </p>
                                                </div>
                                                <div className="availability">
                                                    <i className="fas fa-check-circle" />
                                                    <span>200 in stock</span>
                                                </div>
                                                <form className="single-cart">
                                                    <input
                                                        type="number"
                                                        className="input-text"
                                                        min="1"
                                                        value={quantity}
                                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                                    />
                                                    <button
                                                        className="custom-button button-small"
                                                        onClick={(e) => {
                                                        e.preventDefault();
                                                        handleAddToCart(product);
                                                        }}
                                                        disabled={loadingId === product.id || isInCart(product.id)}
                                                    >
                                                        {loadingId === product.id ? (
                                                        <>
                                                            <i className="fas fa-spinner fa-spin"></i> Adding...
                                                        </>
                                                        ) : isInCart(product.id) ? (
                                                        "Added"
                                                        ) : (
                                                        "Add To Cart"
                                                        )}
                                                    </button>
                                                    <BuyNowPopupCheckout
                                                        product={product}
                                                        API_URL={API_URL}
                                                        consumerKey="ck_f43a06935403d58d90635d22f1db7e10570e2b73"
                                                        consumerSecret="cs_2029a263378e25918c8886931b530f0ab82ff9e1"
                                                    />
                                                </form>
                                                <div className="share-on">
                                                    <h4>SHARE PRODUCT:</h4>
                                                    <div className="social-links text-alignleft">
                                                        <ul>
                                                            <li>
                                                                <a href="https://facebook.com" target="_blank" rel="noreferrer">
                                                                Facebook
                                                                </a>
                                                            </li>
                                                            <li>
                                                                <a href="https://twitter.com" target="_blank" rel="noreferrer">
                                                                Twitter
                                                                </a>
                                                            </li>
                                                            <li>
                                                                <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                                                                LinkedIn
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className="entry-meta product-meta">
                                                    <h4>CATEGORY :</h4>
                                                    <span className="cat-links">
                                                    <a href="/">Clothes</a>, <a href="/">Winter</a>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="tabs" className="product-tabs wc-tabs-wrapper">
                                    <ul className="tabs wc-tabs nav-tabs">
                                        <li className="nav-item">
                                            <a href="#description">Description</a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="#add-description">Additional Description</a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="#reviews">Reviews</a>
                                        </li>
                                    </ul>
                                    <div className="tab-content">
                                        <div className="tab-pane active" id="description">
                                            <h2>Description</h2>
                                            <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.</p>
                                        </div>
                                        <div className="tab-pane" id="add-description">
                                            <h2>Additional Description</h2>
                                            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"</p>
                                        </div>
                                        <div className="tab-pane" id="reviews">
                                            <h2>Reviews</h2>
                                            <p>There are no reviews yet.</p>
                                        </div>
                                    </div>
                                </div>
                            </main>
                        </div>
                        <div id="sidebar-primary" className="sidebar widget-area">
                            <aside className="widget widget-category">
                            <h3 className="widget-title">Categories</h3>
                            <ul>
                                <li className="active">
                                <a href="/">Outerwear</a>
                                </li>
                                <li>
                                <a href="/">Winter</a>
                                </li>
                                <li>
                                <a href="/">Denim</a>
                                </li>
                            </ul>
                            </aside>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        )}
    </>
    );
};

export default ProductDetailsPage;