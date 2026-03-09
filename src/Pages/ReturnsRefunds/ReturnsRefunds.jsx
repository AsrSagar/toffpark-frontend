import React from "react";
import { Link } from "react-router-dom";
import "./ReturnsRefunds.css";

const ReturnExchangePolicy = () => {
  return (
    <>
    <div id="custom-header">
        <div className="custom-header-content">
            <div className="container">
                <div id="breadcrumb">
                    <div className="breadcrumbs breadcrumb-trail">
                        <ul className="trail-items">
                            <li className="trail-item trail-begin">
                                <Link to="/">
                                    <span>Home</span>
                                </Link>
                            </li>
                            <li className="trail-item trail-end">
                                <span>Returns & Refunds</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <aside className="section no-padding">
        <div className="container">
            <div className="content-block">
                <div className="return-policy">
                    <h2>Return & Exchange Policy</h2>
                    <p>
                        We offer <strong>3 days return and exchange facility</strong>. Before
                        returning or exchanging an item, please read through our return &
                        exchange policy to make sure the purchased item is eligible for
                        return/refund.
                    </p>
                    <h3>Return & Exchange Terms</h3>
                    <ul>
                        <li>
                        If the product is defective, damaged, incorrect, or incomplete at the
                        time of delivery.
                        </li>
                        <li>If the size of a product does not fit the one you ordered.</li>
                        <li>
                        If the customer wants to change the color for the same design (based
                        on availability).
                        </li>
                        <li>
                        The products are <strong>not eligible for return</strong> if the item
                        is “No longer needed”.
                        </li>
                        <li>
                        Exchange of product is allowed <strong>only once</strong> after a
                        purchase.
                        </li>
                        <li>
                        Return charge will be paid at the customer’s expense and customers
                        will need to arrange their own shipping.
                        </li>
                        <li>
                        <strong>Money shall not be refunded under any circumstances.</strong>
                        </li>
                    </ul>
                    <h3>Return & Exchange Conditions</h3>
                    <ul>
                        <li>
                        The product must be unused, unworn, unwashed, and without any flaws.
                        </li>
                        <li>
                        The product must include the original tags, user manual, warranty
                        cards, freebies, and accessories.
                        </li>
                        <li>
                        The product must be returned in the original and undamaged
                        manufacturer packaging/box.
                        </li>
                    </ul>
                    <h3>Return & Exchange Procedure</h3>
                    <ul>
                        <li>
                        The customer must call/message us within <strong>3 days</strong> of
                        receiving/purchasing the item to claim a return or exchange request.
                        </li>
                    </ul>
                    <p>If the customer is eligible for exchange:</p>
                    <ul>
                        <li>
                        <strong>For online purchases:</strong> We arrange delivery for exchange
                        in <strong>2–4 days</strong> for in-stock items and{" "}
                        <strong>15–30 days</strong> for out-of-stock items using the same
                        delivery partner (RedX / Pathao).
                        </li>

                        <li>
                        <strong>For experience center purchases:</strong> The customer needs
                        to visit our experience center within <strong>3 days</strong> from the
                        product purchase date to exchange the product.
                        </li>
                    </ul>
                    <p>
                        If you’re eligible for a return, the customer needs to return the
                        product to our warehouse. Once the return is received and accepted, the
                        refund will be processed as <strong>store credit</strong> for a future
                        purchase.
                    </p>
                    <h3>Pre-Order Refund Policy</h3>
                    <p>
                        The customer will get a full refund against their advance payment in
                        normal cases if we are unable to deliver the product within our standard
                        delivery time of <strong>15–30 working days</strong>.
                    </p>
                    <p>
                        We complete the refund and return process within{" "}
                        <strong>7 to 10 working days</strong> for eligible customers.
                    </p>
                </div>
            </div>
        </div>
    </aside>
    </>
  );
};

export default ReturnExchangePolicy;