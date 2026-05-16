import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import config from "../../config";
import "./BlogSinglePage.css";

const BlogSinglePage = () => {
  const { slug } = useParams();

  const [post, setPost] = useState(null);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(
          `${config.API_URL}/wp/v2/posts?slug=${slug}&_embed`
        );

        if (res.data.length > 0) {
          setPost(res.data[0]);
        } else {
          setPost(null);
        }
      } catch (error) {
        console.log("API Error:", error);
        setPost(null);
      }

      // setLoading(false);
    };

    fetchPost();
  }, [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  if (!post) {
    return <div className="container">Post Not Found</div>;
  }

  const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const author = post._embedded?.author?.[0]?.name;
  const category = post._embedded?.["wp:term"]?.[0]?.[0]?.name;

  const dateObj = new Date(post.date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString("default", { month: "short" });

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
              <div className="breadcrumbs breadcrumb-trail">
                <ul className="trail-items">
                  <li className="trail-item">
                    <a href="/">Home</a>
                  </li>

                  <li className="trail-item">
                    <a href="/blog">Blog</a>
                  </li>

                  <li className="trail-item trail-end">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: post.title.rendered,
                      }}
                    />
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
            <div id="primary" className="content-area blog-single">
              <main id="main" className="site-main">
                <article className="post">
                  {image && (
                    <div className="entry-thumb">
                      <img
                        src={image}
                        alt={post.title.rendered}
                        style={{
                          width: "100%",
                          height: "400px",
                          objectFit: "cover"
                        }}
                        loading="lazy"
                      />
                      <div className="latest-news-meta">
                        <div className="latest-news-date">
                          <span className="news-meta-date">{day}</span>
                          <span className="news-meta-months">{month}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="entry-content-wrapper">
                    <header className="entry-header">
                      <h2
                        className="entry-title"
                        dangerouslySetInnerHTML={{
                          __html: post.title.rendered,
                        }}
                      />
                    </header>
                    <div className="entry-meta">
                      {author && (
                        <span className="byline">
                          By <a href="/">{author}</a>
                        </span>
                      )}
                      <span className="comments-link">
                        {post.comment_count || 0} Comments
                      </span>
                      {category && (
                        <span className="cat-links">
                          <a href="/">{category}</a>
                        </span>
                      )}
                    </div>
                    {/* <div
                      className="entry-content"
                      dangerouslySetInnerHTML={{
                        __html: post.content.rendered,
                      }}
                    /> */}
                  </div>
                </article>
              </main>
            </div>
            <div id="sidebar-primary" className="sidebar widget-area">
              <aside className="widget">
                <h3 className="widget-title">
                  <span>Search</span>
                </h3>
                <form className="search-form">
                  <input
                    type="search"
                    placeholder="Search..."
                    className="search-field"
                  />
                  <button type="submit" className="search-submit">
                    Search
                  </button>
                </form>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogSinglePage;