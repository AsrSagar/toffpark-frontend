import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
// Swiper styles import
import "swiper/css";
import "swiper/css/pagination";
import "./TestimonialSlider.css";

const testimonials = [
  {
    id: 1,
    text: "Thanks Ghorerbazar for free Honeyraj. Of course, I got it for being a regular customer.",
    name: "Sultana Yesmin",
    designation: "Housewife",
    image: "/images/author.png"
  },
  {
    id: 2,
    text: "২য় বার Ghorerbazar থেকে অর্ডার করলাম। আগের মতো এবারও দারুণ কোয়ালিটি আর দ্রুত ডেলিভারি পেয়েছি। একদম সন্তুষ্ট।",
    name: "Ayesha Khan",
    designation: "Banker",
    image: "/images/author.png"
  },
  {
    id: 3,
    text: "এই অবিশ্বাসের জগতে আস্থাশীল একটি প্রতিষ্ঠান ঘরের বাজার।",
    name: "Fariha Akter Tumpa",
    designation: "Entrepreneur",
    image: "/images/author.png"
  },
  {
    id: 4,
    text: "এই অবিশ্বাসের জগতে আস্থাশীল একটি প্রতিষ্ঠান ঘরের বাজার।",
    name: "Fariha Akter Tumpa",
    designation: "Entrepreneur",
    image: "/images/author.png"
  }
];

const TestimonialSlider = () => {
  return (
    <section className="testimonial-section">
      <div className="custom-container">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={25}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
          className="testimonial-swiper"
        >
          {testimonials.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="testimonial-card">
                <p className="testimonial-text">“{item.text}”</p>
                
                <div className="user-info">
                  <div className="user-img-wrapper">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="user-placeholder">
                         <i className="fas fa-user"></i>
                      </div>
                    )}
                  </div>
                  <div className="user-details">
                    <h4 className="user-name">{item.name}</h4>
                    <p className="user-designation">{item.designation}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TestimonialSlider;