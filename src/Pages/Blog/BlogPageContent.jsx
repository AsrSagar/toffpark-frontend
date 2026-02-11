import React from "react";
const BlogGridPage = () => {

  return (
    <>
      {/* Header */}
      <div id="custom-header">
        <div className="custom-header-content">
          <div className="container">
            <h1 className="page-title">Blog</h1>

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
                  <li className="trail-item">
                    <span>
                      <a href="/">Blog</a>
                    </span>
                  </li>
                  <li className="trail-item trail-end">
                    <span>Blog Grid</span>
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
        className="site-content default-full-width blog-grid-layout"
      >
        <div className="container">
          <div className="inner-wrapper">
            <div id="primary" className="content-area">
              <main id="main" className="site-main">
                <div className="inner-wrapper">

                  {/* Blog Item */}
                  {[
                    { img: "blog-1.jpg", title: "Product Designing & Marketing" },
                    { img: "blog-2.jpg", title: "Why more developer choose my template ?" },
                    { img: "blog-3.jpg", title: "We are creative web agency" },
                    { img: "blog-4.jpg", title: "Why buying a big house is a bad investment" },
                    { img: "blog-5.jpg", title: "The most successful ones go over the top" },
                    { img: "blog-3.jpg", title: "Successfull business tips way to grow" },
                  ].map((post, index) => (
                    <article key={index} className="hentry post col-grid-4">
                      <div className="entry-content-wrapper box-shadow-block">
                        <div className="entry-thumb aligncenter thumb-overlay">
                          <a href="/">
                            <img
                              src={`/images/blog/${post.img}`}
                              alt="Blog"
                            />
                          </a>

                          <div className="overlay-box">
                            <a href="/">
                              <i className="icon-attachment"></i>
                            </a>
                          </div>

                          <div className="latest-news-meta">
                            <div className="latest-news-date">
                              <span className="news-meta-date">08</span>
                              <span className="news-meta-months">Aug</span>
                            </div>
                          </div>
                        </div>

                        <header className="entry-header">
                          <h2 className="entry-title">
                            <a href="/" rel="bookmark">
                              {post.title}
                            </a>
                          </h2>
                        </header>

                        <div className="entry-meta">
                          <span className="byline">
                            <span className="author vcard">
                              <a href="/">Admin</a>
                            </span>
                          </span>
                          <span className="comments-link">
                            <a href="/">30</a>
                          </span>
                          <span className="cat-links">
                            <a href="/" rel="category tag">
                              Corporate
                            </a>
                          </span>
                        </div>

                        <div className="entry-content">
                          <p>
                            aliquet Aenean sollicitudin, lorem quis bibendum
                            auctor, nisi elit. Proin gravida nibh vel velit
                            auctor aliquet.
                          </p>
                          <a href="/" className="more-link">
                            Read More
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                <nav className="navigation pagination">
                  <div className="nav-links">
                    <span className="page-numbers current">1</span>
                    <a className="page-numbers" href="/">
                      2
                    </a>
                    <a className="page-numbers" href="/">
                      3
                    </a>
                    <a className="next page-numbers" href="/">
                      Next »
                    </a>
                  </div>
                </nav>
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogGridPage;