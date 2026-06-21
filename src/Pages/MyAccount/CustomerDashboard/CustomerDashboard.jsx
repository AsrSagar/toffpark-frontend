import React, { useEffect, useState } from "react";
import config from "../../../config";
import "./CustomerDashboard.css";

const CustomerDashboard = () => {
    const API_URL = config.API_URL;
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("dashboard");
    
    // 📊 ডাটা স্টেট সমূহ
    const [orders, setOrders] = useState([]);
    const [downloads, setDownloads] = useState([]);
    const [addresses, setAddresses] = useState({ billing: {}, shipping: {} });
    const [accountDetails, setAccountDetails] = useState({ first_name: "", last_name: "", email: "" });
    const [passwordData, setPasswordData] = useState({ current_password: "", new_password: "" });
    const [updateMessage, setUpdateMessage] = useState({ type: "", text: "" });

    const token = localStorage.getItem("token");
    const displayName = localStorage.getItem("user_display_name") || "Developer";
    const userEmail = localStorage.getItem("user_email") || "";
    const avatarUrl = userEmail 
        ? `https://secure.gravatar.com/avatar/${navigator.userAgent}?s=128&d=mm` 
        : "https://secure.gravatar.com/avatar/2a82fd288e2f8d0197445dd6b55a79a874170813f4790f36aec05a91312a2ff6?s=128&d=mm";

    // 🔄 ডাটা ফেস করার ইফেক্ট
useEffect(() => {
    if (!token) {
        setLoading(false);
        return;
    }

    setLoading(true);

    // ১. ইউজার প্রোফাইল ডাটা ও অর্ডারের চেইন্ড এপিআই কল
    const fetchUserDataAndOrders = fetch(`${API_URL}/wp/v2/users/me?context=edit`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error("User API call failed");
        return res.json();
    })
    .then(user => {
        if (user && user.id) {
            setAccountDetails({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email || ""
            });

            // 📍 WooCommerce অ্যাড্রেস ডাটা ম্যাপিং
            const meta = user.meta || {};
            setAddresses({
                billing: {
                    first_name: meta.billing_first_name || user.first_name || "",
                    last_name: meta.billing_last_name || user.last_name || "",
                    address_1: meta.billing_address_1 || "Not set yet.",
                    city: meta.billing_city || ""
                },
                shipping: {
                    first_name: meta.shipping_first_name || user.first_name || "",
                    last_name: meta.shipping_last_name || user.last_name || "",
                    address_1: meta.shipping_address_1 || "Not set yet.",
                    city: meta.shipping_city || ""
                }
            });

            // 🎯 FIX 1: এখানে অবশ্যই 'return' করতে হবে যেন Promise.all এটার জন্য অপেক্ষা করে
            return fetch(`${API_URL}/custom-wc/v1/orders?customer_id=${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => {
                if (!res.ok) throw new Error("Orders API call failed");
                return res.json();
            })
            .then(orderData => {
                console.log("Orders Data Received in Fetch:", orderData); // 🔍 ডেব্যাগিং লগ
                setOrders(Array.isArray(orderData) ? orderData : []);
                return user; // পরবর্তী চেইনের জন্য ইউজার অবজেক্ট পাস করলাম
            });
        }
        throw new Error("Invalid User Data");
    })
    .catch(err => {
        console.error("User or Orders Fetch Error:", err);
        setOrders([]);
    });

    // ২. ডাউনলোড ডাটা ফেস (ইন্ডিপেন্ডেন্ট কল কিন্তু ইউজারের আইডি চেইনের সাথে সিঙ্ক করা)
    // যেহেতু ডাউনলোডের জন্যও আইডি লাগবে, তাই আমরা ইউজার প্রমিজ শেষ হওয়ার পর এটি কল করতে পারি অথবা আলাদা রাখতে পারি।
    // এখানে জাস্ট আপনার আগের কলটি ফিক্স করা হলো, তবে ১ নম্বর রিকোয়েস্ট সফল হলে আইডি দিয়ে কল করা বেস্ট।
    const fetchDownloads = fetchUserDataAndOrders.then(user => {
        if (user && user.id) {
            return fetch(`${API_URL}/custom-wc/v1/downloads?customer_id=${user.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                setDownloads(Array.isArray(data) ? data : []);
            });
        }
    }).catch(err => {
        console.error("Downloads Fetch Error:", err);
        setDownloads([]);
    });

    // সব রিকোয়েস্ট শেষ হলে লোডিং ফলস করা
    Promise.all([fetchUserDataAndOrders, fetchDownloads]).finally(() => {
        setLoading(false);
    });

}, [API_URL, token]);

    // 💾 একাউন্ট ডিটেইলস আপডেট সাবমিট হ্যান্ডলার
    const handleAccountUpdate = (e) => {
        e.preventDefault();
        setUpdateMessage({ type: "", text: "" });

        const bodyData = {
            first_name: accountDetails.first_name,
            last_name: accountDetails.last_name,
            email: accountDetails.email,
        };
        if(passwordData.new_password) {
            bodyData.password = passwordData.new_password;
        }

        fetch(`${API_URL}/wp/v2/users/me`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(bodyData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.id) {
                setUpdateMessage({ type: "success", text: "Account details updated successfully!" });
                localStorage.setItem("user_display_name", data.name);
            } else {
                setUpdateMessage({ type: "error", text: data.message || "Failed to update." });
            }
        }).catch(err => {
            setUpdateMessage({ type: "error", text: "Something went wrong!" });
        });
    };

    // 🔐 লগআউট হ্যান্ডলার
    const handleLogout = (e) => {
        if(e) e.preventDefault();
        localStorage.clear();
        window.location.reload();
    };

    if (loading) {
        return <div className="ow-dashboard-loading">Loading account data...</div>;
    }

    console.log("Orders Data:", orders);

    return (
        <aside className="section no-padding static-page-section">
            <div className="container">
                <div id="primary" className="content-area clr ow-custom-dashboard">
                    <div className="woocommerce">
                        
                        {/* ⬅️ সাইডবার মেনু */}
                        <div className="woocommerce-MyAccount-tabs clr">
                            <div className="oceanwp-user-profile clr">
                                <div className="image">
                                    <img
                                        alt={`${displayName}'s Avatar`}
                                        src={avatarUrl}
                                        className="avatar avatar-128 photo"
                                        height="128"
                                        width="128"
                                    />
                                </div>
                                <div className="user-info">
                                    <p className="name">{displayName}</p>
                                </div>
                            </div>
                            <nav className="woocommerce-MyAccount-navigation">
                                <ul>
                                    {["dashboard", "orders", "downloads", "addresses", "account"].map((tab) => (
                                        <li key={tab} className={`woocommerce-MyAccount-navigation-link ${activeTab === tab ? "is-active" : ""}`}>
                                            <a href={`#${tab}`} onClick={(e) => { e.preventDefault(); setActiveTab(tab); setUpdateMessage({type:"", text:""}); }}>
                                                {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
                                            </a>
                                        </li>
                                    ))}
                                    <li className="woocommerce-MyAccount-navigation-link"><a href="#logout" onClick={handleLogout}>Log out</a></li>
                                </ul>
                            </nav>
                        </div>

                        {/* ➡️ মেইন কন্টেন্ট এরিয়া */}
                        <div className="woocommerce-MyAccount-content">
                            {updateMessage.text && <div className={`ow-alert ${updateMessage.type}`}>{updateMessage.text}</div>}
                            
                            {activeTab === "dashboard" && (
                                <div className="ow-welcome-card">
                                    <p>Hello <strong>{displayName}</strong> (not {displayName}? <a href="#logout" onClick={handleLogout}>Log out</a>)</p>
                                    <p>From your account dashboard you can view your recent orders, manage shipping/billing addresses, and edit account details.</p>
                                </div>
                            )}

                            {/* 📦 অর্ডার ট্যাব */}
                            {activeTab === "orders" && (
                                <div className="ow-table-wrapper">
                                    {orders.length === 0 ? (
                                        <p className="ow-no-data">No orders found.</p>
                                    ) : (
                                        <>
                                            <table className="ow-screenshot-table">
                                                <thead>
                                                    <tr>
                                                        <th>ORDER</th>
                                                        <th>DATE</th>
                                                        <th>STATUS</th>
                                                        <th>TOTAL</th>
                                                        <th>ACTIONS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orders.map((order) => {
                                                        const orderNum = order.number || order.order_number || order.id;
                                                        const orderDate = order.date || order.date_created || "N/A";
                                                        const orderStatus = order.status || "Pending";
                                                        const orderTotal = order.total || order.order_total || "0.00";
                                                        const itemCount = order.item_count || order.items_count || 1;

                                                        return (
                                                            <tr key={order.id}>
                                                                <td className="order-number">#{orderNum}</td>
                                                                <td className="order-date">{orderDate}</td>
                                                                <td className="order-status">
                                                                    <span className={`status-badge ${orderStatus.toLowerCase()}`}>
                                                                        {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
                                                                    </span>
                                                                </td>
                                                                <td className="order-total">
                                                                    <span className="currency-symbol">৳</span>
                                                                    {体力 => Number(orderTotal).toLocaleString('en-US', { 
                                                                        minimumFractionDigits: 2, 
                                                                        maximumFractionDigits: 2 
                                                                    })}
                                                                    <span className="item-count">
                                                                        {" "}For {itemCount} {itemCount > 1 ? 'Items' : 'Item'}
                                                                    </span>
                                                                </td>
                                                                <td className="order-actions">
                                                                    <a href={`/view-order/${order.id}`} className="ow-view-btn">
                                                                        VIEW{" "}
                                                                        <svg className="view-eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                                            <circle cx="12" cy="12" r="3"></circle>
                                                                        </svg>
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                            <div className="ow-pagination-area">
                                                <button className="ow-next-btn" onClick={() => console.log("Next page trigger")}>
                                                    NEXT
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* 📥 ডাউনলোডস ট্যাব */}
                            {activeTab === "downloads" && (
                                <div className="ow-table-wrapper">
                                    {downloads.length === 0 ? (
                                        <p className="ow-no-data">No downloads available yet.</p>
                                    ) : (
                                        <table className="ow-data-table">
                                            <thead>
                                                <tr><th>Product</th><th>Downloads Remaining</th><th>Expires</th><th>Download</th></tr>
                                            </thead>
                                            <tbody>
                                                {downloads.map((dl, index) => (
                                                    <tr key={index}>
                                                        <td>{dl.product_name}</td>
                                                        <td>{dl.downloads_remaining || "Unlimited"}</td>
                                                        <td>{dl.access_expires || "Never"}</td>
                                                        <td><a href={dl.download_url} className="ow-btn-download" target="_blank" rel="noreferrer">Download File</a></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                            {/* 📍 অ্যাড্রেস ট্যাব */}
                            {activeTab === "addresses" && (
                                <div className="ow-address-grid">
                                    <div className="address-card">
                                        <h3>Billing Address</h3>
                                        <p><strong>Name:</strong> {addresses.billing.first_name} {addresses.billing.last_name}</p>
                                        <p><strong>Address:</strong> {addresses.billing.address_1}</p>
                                        <p><strong>City:</strong> {addresses.billing.city}</p>
                                    </div>
                                    <div className="address-card">
                                        <h3>Shipping Address</h3>
                                        <p><strong>Name:</strong> {addresses.shipping.first_name} {addresses.shipping.last_name}</p>
                                        <p><strong>Address:</strong> {addresses.shipping.address_1}</p>
                                        <p><strong>City:</strong> {addresses.shipping.city}</p>
                                    </div>
                                </div>
                            )}

                            {/* ⚙️ একাউন্ট ডিটেইলস ট্যাব */}
                            {activeTab === "account" && (
                                <form onSubmit={handleAccountUpdate} className="ow-account-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>First Name</label>
                                            <input type="text" value={accountDetails.first_name} onChange={(e) => setAccountDetails({...accountDetails, first_name: e.target.value})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Last Name</label>
                                            <input type="text" value={accountDetails.last_name} onChange={(e) => setAccountDetails({...accountDetails, last_name: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address *</label>
                                        <input type="email" required value={accountDetails.email} onChange={(e) => setAccountDetails({...accountDetails, email: e.target.value})} />
                                    </div>
                                    <fieldset>
                                        <legend>Password Change</legend>
                                        <div className="form-group">
                                            <label>New Password (leave blank to leave unchanged)</label>
                                            <input type="password" value={passwordData.new_password} onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})} />
                                        </div>
                                    </fieldset>
                                    <button type="submit" className="ow-submit-btn">Save Changes</button>
                                </form>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default CustomerDashboard;