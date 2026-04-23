import React, { useEffect, useState } from "react";
import config from "../../config";
import { Link } from "react-router-dom";
import axios from "axios";

const BlogGridPage = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          `${config.API_URL}/wp/v2/posts?_embed&per_page=6&page=${page}`
        );

        setPosts(res.data);
        setTotalPages(parseInt(res.headers["x-wp-totalpages"]));
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [page]);

  console.log(posts);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString("default", { month: "short" }),
    };
  };

  if (loading) {
    return (
      <div className="full-page-loader">
        <div className="spinner"></div>
        <p>Loading Products...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
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
                    <span>Blog</span>
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

                  {posts.map((post) => {
                    const image =
                      post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

                    const { day, month } = formatDate(post.date);

                    return (
                      <article
                        key={post.id}
                        className="hentry post col-grid-4"
                      >
                        <div className="entry-content-wrapper">
                          <div className="entry-thumb aligncenter thumb-overlay">
                            <Link to={`/blog/${post.slug}`}>
                              {image && (
                                <img
                                  src={image}
                                  alt={post.title.rendered}
                                />
                              )}
                            </Link>

                            <div className="overlay-box">
                              <Link to={`/blog/${post.slug}`}>
                                <i className="icon-attachment"></i>
                              </Link>
                            </div>

                            <div className="latest-news-meta">
                              <div className="latest-news-date">
                                <span className="news-meta-date">
                                  {day}
                                </span>
                                <span className="news-meta-months">
                                  {month}
                                </span>
                              </div>
                            </div>
                          </div>

                          <header className="entry-header">
                            <h2 className="entry-title">
                              <Link
                                to={`/blog/${post.slug}`}
                                rel="bookmark"
                                dangerouslySetInnerHTML={{
                                  __html: post.title.rendered,
                                }}
                              />
                            </h2>
                          </header>

                          <div className="entry-meta">
                            <span className="byline">
                              <span className="author vcard">
                                Admin
                              </span>
                            </span>
                            <span className="comments-link">
                              {post.comment_count || 0}
                            </span>
                            <span className="cat-links">
                              {post._embedded?.["wp:term"]?.[0]?.[0]?.name}
                            </span>
                          </div>

                          <div
                            className="entry-content"
                            dangerouslySetInnerHTML={{
                              __html: post.excerpt.rendered,
                            }}
                          />
                        </div>
                      </article>
                    );
                  })}

                </div>

                {/* Pagination */}
                <nav className="navigation pagination">
                  <div className="nav-links">

                    {page > 1 && (
                      <Link
                        className="prev page-numbers"
                        onClick={() => setPage(page - 1)}
                        style={{ cursor: "pointer" }}
                      >
                        « Previous
                      </Link>
                    )}

                    {[...Array(totalPages)].map((_, index) => (
                      <span
                        key={index}
                        className={
                          page === index + 1
                            ? "page-numbers current"
                            : "page-numbers"
                        }
                        onClick={() => setPage(index + 1)}
                        style={{ cursor: "pointer" }}
                      >
                        {index + 1}
                      </span>
                    ))}

                    {page < totalPages && (
                      <Link
                        className="next page-numbers"
                        onClick={() => setPage(page + 1)}
                        style={{ cursor: "pointer" }}
                      >
                        Next »
                      </Link>
                    )}

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
