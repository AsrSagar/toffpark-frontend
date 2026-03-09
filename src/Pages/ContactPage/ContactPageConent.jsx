import React from "react";

const ContactPageContent = () => {
  return (
    <>
      {/* Header */}
      <div id="custom-header">
        <div className="custom-header-content">
          <div className="container">
            <div id="breadcrumb">
              <div
                aria-label="Breadcrumbs"
                className="breadcrumbs breadcrumb-trail"
              >
                <ul className="trail-items">
                  <li className="trail-item trail-begin">
                    <a href="/" rel="home">
                      <span>Home</span>
                    </a>
                  </li>
                  <li className="trail-item trail-end">
                    <span>Contact Us</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        id="content"
        className="site-content global-layout-no-sidebar contact-page"
      >
        <div className="container">
          <div className="inner-wrapper">
            <div id="primary" className="content-area">
              <main id="main" className="site-main">
                <aside className="section section-quick-contact">
                  <div className="container">
                    <div className="inner-wrapper">
                      {/* Map */}
                      <div className="col-grid-7">
                        <div className="contact-map">
                          <div className="map-inner-wrapper">
                            <iframe
                              className="googlemap"
                              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3151.8351118085707!2d144.955652!3d-37.817330999999996!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d4c2b349649%3A0xb6899234e561db11!2sEnvato!5e0!3m2!1str!2s!4v1426175044731"
                              width="700"
                              height="525"
                              loading="lazy"
                              title="Google Map"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Contact Form */}
                      <div className="col-grid-5">
                        <div className="contact-form-area contactdesc">
                          <h3 className="contact-title">Contact Us</h3>

                          <div id="contact-form" className="contact-form">
                            <div id="message"></div>

                            <form
                              id="contactform"
                              action="https://anilbasnet.net/demo/byapar/contact.php"
                              name="contactform"
                              method="post"
                            >
                              <input
                                type="text"
                                name="name"
                                id="name"
                                className="form-control"
                                placeholder="Name *"
                              />

                              <input
                                type="email"
                                name="email"
                                id="email"
                                className="form-control"
                                placeholder="Email *"
                              />

                              <textarea
                                className="form-control"
                                name="comments"
                                id="comments"
                                rows="6"
                                placeholder="Message"
                              />

                              <button type="submit" id="submit">
                                Submit
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPageContent;