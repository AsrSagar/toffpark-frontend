// src/api/woocommerce.js
import axios from "axios";
import config from "../config";

export const wcApi = axios.create({
  baseURL: `${config.API_URL}/wc/v3`,
  auth: {
    username: "ck_f43a06935403d58d90635d22f1db7e10570e2b73",
    password: "cs_2029a263378e25918c8886931b530f0ab82ff9e1",
  },
});