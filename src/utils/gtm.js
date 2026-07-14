// utils/gtm.js
window.dataLayer = window.dataLayer || [];

export const pushDataLayer = (data) => {
  window.dataLayer.push({
    ...data,
    event: data.event || "event"
  });
};