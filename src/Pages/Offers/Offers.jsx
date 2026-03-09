import React from "react";
import { Link } from "react-router-dom";

const OffersPage = () => {
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
                                <span>Offers</span>
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
                <div className="eid-salami-page" style={{maxWidth:"900px", margin:"0 auto", padding:"20px", fontFamily:"sans-serif"}}>
                    <h2 style={{textAlign:"center"}}>
                        জুতা কিনুন, ঈদ সালামি জিতুন!
                    </h2>
                    <div style={{textAlign:"center", margin:"20px 0"}}>
                        <img
                        src="/images/offer.jpeg"
                        alt="Eid Salami Campaign"
                        style={{width:"100%", borderRadius:"6px"}}
                        />
                    </div>
                    <h3 style={{textAlign:"center"}}>
                        3000+ Salami gifts Including 50000 Tk Gift Voucher, 20000 Tk Gift Voucher,
                        10000 Tk Gift Voucher & More!
                    </h3>

                    <p>
                        Eid is a time of joy and celebration, and Toffpark is making it even more
                        special with the exclusive <strong>"জুতা কিনুন, ঈদ সালামি জিতুন"</strong> campaign
                        for Eid 2026. This exciting campaign started on the 6th of Ramadan
                        (February 24) and will run until Eid ul-Fitr, giving customers the
                        chance to win 100–50000 Tk gift vouchers while shopping for their
                        favorite footwear.
                    </p>

                    <p>
                        Win <strong>3,000+ Salami Prizes</strong>, including 50000 Tk Gift Voucher,
                        20000 Tk Gift Vouchers, Free Membership, and more!
                    </p>

                    <p>
                        When you purchase an item from Toffpark, you will receive a scratch card.
                        By scratching the card, you have the chance to win Eid Salami Gift
                        Voucher and Free Membership.
                    </p>

                    <p><strong>Here’s the detailed breakdown of the salami gifts list:</strong></p>

                    {/* Table */}
                    <div style={{display:"flex", justifyContent:"center"}}>
                        <table border="1" cellPadding="8" style={{borderCollapse:"collapse", textAlign:"center"}}>
                        <thead>
                            <tr>
                            <th>Salami</th>
                            <th>Salami Details</th>
                            <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>1</td><td>50000 Tk Gift Voucher</td><td>1</td></tr>
                            <tr><td>2</td><td>20000 Tk Gift Voucher</td><td>2</td></tr>
                            <tr><td>3</td><td>10000 Tk Gift Voucher</td><td>3</td></tr>
                            <tr><td>4</td><td>5000 Tk Gift Voucher</td><td>5</td></tr>
                            <tr><td>5</td><td>2000 Tk Gift Voucher</td><td>40</td></tr>
                            <tr><td>6</td><td>1000 Tk Gift Voucher</td><td>60</td></tr>
                            <tr><td>7</td><td>500 Tk Gift Voucher</td><td>100</td></tr>
                            <tr><td>8</td><td>300 Tk Gift Voucher</td><td>300</td></tr>
                            <tr><td>9</td><td>100 Tk Gift Voucher</td><td>500</td></tr>
                            <tr><td>10</td><td>Free Membership</td><td>2000</td></tr>
                            <tr>
                            <td colSpan="2"><strong>Total Salami</strong></td>
                            <td><strong>3011</strong></td>
                            </tr>
                        </tbody>
                        </table>
                    </div>

                    {/* Terms */}
                    <div style={{marginTop:"30px"}}>
                        <h3>Terms & Conditions:</h3>

                        <ul>
                        <li>Customers will receive a scratch card for every pair of shoes or sandals they purchase.</li>
                        <li>All accessories are excluded from this campaign.</li>
                        <li>Free membership will be given as per company policy.</li>
                        <li>Toffpark reserves all the rights to this scratch card.</li>
                        <li>Toffpark has the right to cancel/change/extend/postpone this promotion at any time.</li>
                        <li>Each scratch card can only be used once and will receive only one reward.</li>
                        </ul>
                    </div>

                    {/* CTA */}
                    <div style={{textAlign:"center", marginTop:"30px", fontWeight:"bold"}}>
                        Buy Shoe, Get a Scratch Card and Get Chance to Win Exciting Eid Salami Gifts!
                    </div>
                </div>
            </div>
        </div>
    </aside>

    </>
  );
};

export default OffersPage;