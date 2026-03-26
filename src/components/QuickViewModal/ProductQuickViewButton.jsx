import React, { useState } from "react";
import { getProductById } from "../../api/products";

const ProductQuickViewButton = ({ productId, onProductLoaded }) => {
  const [loading, setLoading] = useState(false);

  const handleQuickView = async (id) => {
    setLoading(true);
    try {

      const [product] = await Promise.all([
        getProductById,
        new Promise((resolve) => setTimeout(resolve, 1000))
      ]);

      onProductLoaded(product);
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log("Product ID:", getProductById);

  return (
    <button
      className="product-button tooltip"
      disabled={loading}
      onClick={(e) => {
        e.preventDefault(); 
        handleQuickView(productId);
      }}
    >
      {loading ? (
        <i className="fas fa-spinner fa-spin"></i>
      ) : (
        <i className="far fa-eye"></i>
      )}
      <span className="tooltiptext tooltip-right">
        {loading ? "LOADING..." : "QUICK VIEW"}
      </span>
    </button>
  );
};

export default ProductQuickViewButton;