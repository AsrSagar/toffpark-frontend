import { useCart } from "../../context/CartContext";

const HeaderMiniCart = () => {
  const {
    cartItems,
    setCartOpen,
  } = useCart();
  const toggleMiniCart = (e) => {
    e.preventDefault();
    setCartOpen(true); 
  };

  return (

    <div id="header-right" className="pull-right">
      <div className="hearder-min-cart">
        <ul>
          <li className="cart-button mini-cart-wrap">
            <a href="/" onClick={toggleMiniCart}>
              <i className="icon-basket"></i>
              <span>{cartItems.length}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HeaderMiniCart;
