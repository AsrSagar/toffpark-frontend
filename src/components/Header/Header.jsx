import React from "react";
import NavBar from "./NavBar";

const Header = () => {
  return (
    <div id="page" className="site">
      <a href="/" id="mobile-trigger" type="button">
        <i className="fa fa-list" aria-hidden="true"></i>
      </a>

      <div id="mob-menu">
        <ul>
          <li className="current-menu-item menu-item-has-children">
            <a href="/">Home</a>
            <ul className="sub-menu">
              <li><a href="/home-v1">Home v1</a></li>
              <li><a href="/home-v2">Home v2</a></li>
              <li><a href="/home-v3">Home v3</a></li>
              <li><a href="/home-v4">Home v4</a></li>
              <li><a href="/home-v5">Home v5</a></li>
              <li><a href="/home-v6">Home v6</a></li>
            </ul>
          </li>

          <li className="menu-item-has-children">
            <button type="button">Categories</button>

            <ul className="sub-menu">
              <li className="menu-item-has-children">
                <button type="button">Dresses</button>
                <ul className="sub-menu">
                  <li><a href="/casual-dresses">Casual dresses</a></li>
                  <li><a href="/evening">Evening</a></li>
                  <li><a href="/party">Party</a></li>
                  <li><a href="/printed">Printed</a></li>
                  <li><a href="/winter">Winter</a></li>
                </ul>
              </li>

              <li className="menu-item-has-children">
                <button type="button">Tops category</button>
                <ul className="sub-menu">
                  <li><a href="/blouses">Blouses</a></li>
                  <li><a href="/evening-tops">Evening tops</a></li>
                  <li><a href="/work">Work</a></li>
                  <li><a href="/winter-tops">Winter</a></li>
                  <li><a href="/summer">Summer</a></li>
                </ul>
              </li>

              <li className="menu-item-has-children">
                <button type="button">Lingerie</button>
                <ul className="sub-menu">
                  <li><a href="/bras">Bras</a></li>
                  <li><a href="/knickers">Knickers</a></li>
                  <li><a href="/nightwear">Nightwear</a></li>
                  <li><a href="/summerwear">Summerwear</a></li>
                  <li><a href="/men-fashion">Men Fashion</a></li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div id="tophead">
        <div className="container">
          <div className="top-head-left">
            <div className="top-head-col multi-language pull-left">
                <a href="/" className="multi-language-current" type="button">
                  <img src="/images/language/en.png" alt="language" /> English
                </a>
                <ul class="multi-language-sub">
                  <li><a href="/"><img alt="language" src="/images/language/nl.png"/>Nederlands</a></li>
                  <li><a href="/"><img alt="language" src="/images/language/la.png"/>Latin</a></li>
                  <li><a href="/"><img alt="language" src="/images/language/nl.png"/>Nederlands</a></li>
                </ul>
            </div>
            <div className="top-head-col quick-contact pull-left">
              <ul>
                <li className="quick-call">
                  <i className="fas fa-phone-volume"></i>
                  <a href="tel:+5417543010">+541-754-3010</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="top-head-right pull-right">
            <a href="/" className="header-link" type="button">
              <i className="fas fa-phone"></i>
              <span className="header-text">Help</span>
            </a>

            <a href="/" className="header-link" type="button">
              <i className="fas fa-th-large"></i>
              <span className="header-text">More</span>
            </a>

            <a href="/" className="header-link my-account" type="button">
              <i className="fa fa-user"></i>
              <span className="header-text">Account</span>
            </a>
          </div>
        </div>
      </div>
      <NavBar />
    </div>
  );
};

export default Header;
