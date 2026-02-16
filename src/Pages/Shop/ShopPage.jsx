import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import config from "../../config";

const ShopPage = () => {
  const API_URL = config.API_URL;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage] = useState(1);
  const perPage = 12;

  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  // Extract slug from permalink
  const getSlugFromPermalink = (permalink) => {
    if (!permalink) return "";
    return permalink.split("/").filter(Boolean).pop();
  };

  const goToProduct = (permalink) => {
    const slug = getSlugFromPermalink(permalink);
    if (!slug) return;
    navigate(`/product/${slug}`);
  };

  // Add to cart + Meta Pixel event
  const handleAddToCart = (product) => {
    if (isInCart(product.id)) return;

    addToCart(product);

    // FB Pixel AddToCart
    if (window.fbq) {
      window.fbq("track", "AddToCart", {
        content_ids: [product.id],
        content_name: product.name,
        content_type: "product",
        value: product.prices?.price
          ? parseFloat(product.prices.price) / 100
          : 0,
        currency: "BDT",
      });
    }
  };

  // Fetch products
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/wc/store/v1/products?page=${currentPage}&per_page=${perPage}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Product fetch error:", err);
        setLoading(false);
      });
  }, [API_URL, currentPage]);

  return (
    <>
      <div id="custom-header">
        <div className="custom-header-content">
          <div className="container">
            <h1 className="page-title">Shop</h1>
            <div id="breadcrumb">
              <div aria-label="Breadcrumbs" className="breadcrumbs breadcrumb-trail">
                <ul className="trail-items">
                  <li className="trail-item trail-begin"><span>Home</span></li>
                  <li className="trail-item trail-end"><span>Shop</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="content" className="site-content default-full-width">
        <div className="container">
          <div className="inner-wrapper">
            <div id="primary" className="content-area">
              <main id="main" className="site-main">
                <div className="section-products">
                  <div className="inner-wrapper">
                    <div className="products-inner-wrapper clear-fix">

                      {loading
                        ? [...Array(perPage)].map((_, idx) => (
                            <div key={idx} className="product-item col-grid-3 top-space">
                              <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                                <div className="product-thumb zoom-effect skeleton"></div>
                                <div className="product-item-details skeleton"></div>
                              </div>
                            </div>
                          ))
                        : products.length > 0
                        ? products.map((product) => (
                            <div key={product.id} className="product-item col-grid-3 top-space">
                              <div className="product-item-wrapper zoom-effect-hover-container box-shadow-block">
                                <div className="product-thumb zoom-effect">
                                  <a
                                    className="thumbnail"
                                    href={product.permalink}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      goToProduct(product.permalink);
                                    }}
                                  >
                                    <img alt={product.name} src={product.images[0]?.src} />
                                  </a>

                                  <div className="pruduct-buttons">
                                    <button
                                      className="product-button tooltip"
                                      onClick={() => handleAddToCart(product)}
                                      disabled={isInCart(product.id)}
                                    >
                                      <i
                                        className={
                                          isInCart(product.id)
                                            ? "fas fa-check"
                                            : "fas fa-cart-plus"
                                        }
                                      ></i>
                                      <span className="tooltiptext tooltip-right">
                                        {isInCart(product.id) ? "Added" : "Add To Cart"}
                                      </span>
                                    </button>

                                    <button className="product-button tooltip">
                                      <i className="far fa-heart"></i>
                                      <span className="tooltiptext tooltip-right">Wishlist</span>
                                    </button>

                                    <button className="product-button tooltip">
                                      <i className="fa fa-retweet"></i>
                                      <span className="tooltiptext tooltip-right">Compare</span>
                                    </button>
                                  </div>
                                </div>

                                <div className="product-item-details">
                                  <h3 className="product-title">
                                    <Link to={`/product/${getSlugFromPermalink(product.permalink)}`}>
                                      {product.name}
                                    </Link>
                                  </h3>
                                  <div
                                    className="product-price-container"
                                    dangerouslySetInnerHTML={{ __html: product.price_html }}
                                  />
                                </div>

                              </div>
                            </div>
                          ))
                        : <p>No products found.</p>
                      }

                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopPage;
