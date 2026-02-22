import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import config from "../../config";

const BlogSinglePage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(
          `${config.API_URL}/wp/v2/posts?slug=${slug}&_embed`
        );
        setPost(res.data[0]);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPost();
  }, [slug]);

  if (!post) return <div className="container">Loading...</div>;

  const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const author = post._embedded?.author?.[0]?.name;
  const category = post._embedded?.["wp:term"]?.[0]?.[0]?.name;
  const dateObj = new Date(post.date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString("default", { month: "short" });

  return (
    <>
      <div id="custom-header">
        <div className="custom-header-content">
          <div className="container">
            <h1 className="page-title">Blog</h1>
            <div id="breadcrumb">
              <div aria-label="Breadcrumbs" className="breadcrumbs breadcrumb-trail">
                <ul className="trail-items">
                  <li className="trail-item trail-begin">
                    <a href="/" rel="home">
                      <span>Home</span>
                    </a>
                  </li>
                  <li className="trail-item">
                    <span>
                      <a href="/blog">Blog</a>
                    </span>
                  </li>
                  <li className="trail-item trail-end">
                    <span>{post.title.rendered}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="content" className="site-content global-layout-right-sidebar">
        <div className="container">
          <div className="inner-wrapper">
            <div id="primary" className="content-area">
              <main id="main" className="site-main">
                <article className="hentry post">
                  <div className="entry-thumb aligncenter thumb-overlay">
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "800px",
                        height: "400px",
                        overflow: "hidden",
                        position: "relative",
                        backgroundColor: "#eee"
                      }}
                    >
                      {image && (
                        <img
                          ref={imageRef}
                          src={image}
                          alt={post.title.rendered}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: imageLoaded ? "block" : "none",
                          }}
                          onLoad={() => setImageLoaded(true)}
                        />
                      )}
                      {!imageLoaded && <div style={{ width: "100%", height: "100%", backgroundColor: "#ddd" }} />}
                    </div>

                    <div className="overlay-box">
                      <a href="/">
                        <i className="icon-attachment"></i>
                      </a>
                    </div>

                    <div className="latest-news-meta">
                      <div className="latest-news-date">
                        <span className="news-meta-date">{day}</span>
                        <span className="news-meta-months">{month}</span>
                      </div>
                    </div>
                  </div>

                  <div className="entry-content-wrapper">
                    <header className="entry-header">
                      <h2
                        className="entry-title"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                      />
                    </header>

                    <div className="entry-meta">
                      <span className="byline">
                        <span className="author vcard">
                          <a href="/">{author}</a>
                        </span>
                      </span>
                      <span className="comments-link">
                        <a href="/">{post.comment_count || 0}</a>
                      </span>
                      <span className="cat-links">
                        <a href="/">{category}</a>
                      </span>
                    </div>

                    <div
                      className="entry-content"
                      dangerouslySetInnerHTML={{ __html: post.content.rendered }}
                    />
                  </div>
                </article>
              </main>
            </div>

            <div id="sidebar-primary" className="sidebar widget-area">
              <div className="sidebar-widget-wrapper">
                <aside className="widget">
                  <h3 className="widget-title">
                    <span className="widget-title-wrapper">Search</span>
                  </h3>
                  <form className="search-form">
                    <input type="search" placeholder="Search..." className="search-field" />
                    <input type="submit" value="Search" className="search-submit" />
                  </form>
                </aside>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default BlogSinglePage;