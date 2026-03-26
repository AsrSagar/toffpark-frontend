import { useState } from "react";
import { Range } from "react-range";

const PriceFilter = ({ priceRange, priceFilter, setPriceFilter, onApply }) => {
  const STEP = 1;

  return (
    <aside className="widget widget-price-filter">
      <h3 className="widget-title">Filter By Price</h3>
      <div className="price-slider-container">
        <Range
          step={STEP}
          min={priceRange.min}
          max={priceRange.max}
          values={[priceFilter.min, priceFilter.max]}
          onChange={(values) => setPriceFilter({ min: values[0], max: values[1] })}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: "4px",
                background: "#ddd",
                margin: "10px 0"
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: "16px",
                width: "16px",
                backgroundColor: "#e91e63",
                borderRadius: "50%"
              }}
            />
          )}
        />
        <div className="price-values">
          ${priceFilter.min} - ${priceFilter.max}
        </div>
        <button className="custom-button button-small" onClick={onApply}>FILTER</button>
      </div>
    </aside>
  );
};

export default PriceFilter;