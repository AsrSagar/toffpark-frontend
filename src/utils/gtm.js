window.dataLayer = window.dataLayer || [];

export const pushDataLayer = (data) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
};