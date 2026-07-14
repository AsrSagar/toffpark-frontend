import React, { createContext, useState, useEffect, useContext } from 'react';

// Context তৈরি
const ThemeOptionsContext = createContext();

// Provider Component
export const ThemeOptionsProvider = ({ children }) => {
  const [options, setOptions] = useState({
    phone_number: '+8801811877477', 
    top_bar_text: 'Orlazz ঈদ লুটপাট অফার -Up To 60% OFF!',
    site_logo_dark: '',
    site_logo_white: '',
    hero_banner: '',
    category_middle_banner_1: '',
    category_middle_banner_2: '',
    category_middle_banner_3: '',
    category_middle_banner_4: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // কাস্টম ওয়ার্ডপ্রেস এপিআই থেকে একবারই ডেটা ফেচ হবে
    fetch('https://backend.orlazz.com/wp-json/custom/v1/theme-options')
      .then(res => res.json())
      .then(data => {
        setOptions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching global theme options:", err);
        setLoading(false);
      });
  }, []);

  return (
    <ThemeOptionsContext.Provider value={{ options, loading }}>
      {children}
    </ThemeOptionsContext.Provider>
  );
};

// কাস্টম হুক (সহজে ব্যবহার করার জন্য)
export const useThemeOptions = () => useContext(ThemeOptionsContext);