import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import config from "../../../config";
import "./fbtProductList.css";

const FrequentlyBoughtTogether = ({ productId, onChange }) => {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState({});

  const API_URL = config.API_URL;

  useEffect(() => {
    if (!productId) return;
    setLoading(true);

    fetch(`${API_URL}/fbt/v1/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
          setSelected({});
          setSelectedSize({}); // reset sizes
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [productId, API_URL]);

  // Notify parent on selection or size change
  useEffect(() => {
    if (onChange) {
      onChange(products, selected, selectedSize); 
    }
  }, [products, selected, selectedSize, onChange]);

  const toggleProduct = (id) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getSelectedProducts = () => products.filter(p => selected[p.id]);

  const selectedItems = getSelectedProducts();

  const calculateTotal = () => {
    return selectedItems
      .reduce((total, p) => {
        const price = parseFloat(p.price) || 0;
        return total + price;
      }, 0)
      .toFixed(2);
  };

  if (loading || !Array.isArray(products) || products.length === 0) return null;

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="fbt-wrapper">
      <h3>Frequently Bought Together</h3>

      <Slider {...settings}>
        {products.map(product => (
          <div key={product.id} className="fbt-slide">
            <div className="fbt-item">
              <img src={product.images[0].src} alt={product.name} />

              <label className="fbt-checkbox">
                <input
                  type="checkbox"
                  checked={selected[product.id] || false}
                  onChange={() => toggleProduct(product.id)}
                />
                <span>৳ {product.price}</span>
              </label>
              <p className="fbt-name">{product.name}</p>

              {product.type === "variable" && product.attributes?.length > 0 && (
                <div className="fbt-select-wrapper">
                  <select
                    className="fbt-select"
                    value={selectedSize[product.id] || ""}
                    onChange={(e) =>
                      setSelectedSize(prev => ({
                        ...prev,
                        [product.id]: e.target.value
                      }))
                    }
                  >
                    <option value="">Select Size</option>
                    {product.attributes
                      .find(attr => attr.variation === true)
                      ?.options?.map(size => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        ))}
      </Slider>

      <div className="fbt-footer">
        <p>
          Total: <strong>৳{calculateTotal()}</strong>
        </p>
      </div>
    </div>
  );
};

export default FrequentlyBoughtTogether;