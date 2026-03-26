import React from "react";
import "./QuantitySelector.css";

const QuantitySelector = ({ quantity, setQuantity, min = 1 }) => {
  const increment = () => setQuantity(quantity + 1);
  const decrement = () => setQuantity(quantity > min ? quantity - 1 : min);

  const handleChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= min) {
      setQuantity(val);
    }
  };

  return (
    <div className="quantity-wrapper">
      <button type="button" className="qty-btn minus" onClick={decrement}>
        -
      </button>
      <input
        type="number"
        className="qty-input"
        value={quantity}
        min={min}
        onChange={handleChange}
      />
      <button type="button" className="qty-btn plus" onClick={increment}>
        +
      </button>
    </div>
  );
};

export default QuantitySelector;