import axios from "axios";
import config from "../config";

const API_URL = config.API_URL;

export const getProductBySlug = async (slug) => {
  const res = await axios.get(
    `${API_URL}/wc/v3/products?slug=${slug}`
  );
  return res.data[0];
};

export const getProductById = async (id) => {
  const res = await axios.get(
    `${API_URL}/wc/v3/products/${id}`
  );
  return res.data;
};