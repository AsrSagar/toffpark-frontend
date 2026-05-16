import React, { useEffect } from "react";

const ContactPageContent = () => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); 

  // const [loading, setLoading] = useState(true);
  
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //       setLoading(false);
  //   }, 1500); 

  //   return () => clearTimeout(timer);
  // }, []);

  // if (loading) {
  //   return (
  //     <div className="full-page-loader">
  //       <div className="spinner"></div>
  //       <p>Loading...</p>
  //     </div>
  //   );
  // }

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
                          <div className="contact-information">
                            <p>If you have any enquiries, complaints, ideas or general feedback please contact us. Orlazz</p>
                            <p><strong>Phone: </strong><a href="tel:+8801811877477">+8801811877477</a></p>
                            <p><strong>Email: </strong><a href="mailto:support@orlazz.com">support@orlazz.com</a></p>
                          </div>
                          <div className="map-inner-wrapper">
                            <iframe
                              className="googlemap"
                              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.5199788479126!2d90.35467709999999!3d23.800102000000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755bf0671bfe0ef%3A0x7362043fa816f7e2!2sToffpark!5e0!3m2!1sen!2sbd!4v1772737837787!5m2!1sen!2sbd"
                              width="700"
                              height="412"
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