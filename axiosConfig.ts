import axios, { AxiosError, AxiosHeaders } from "axios";
import Cookies from "js-cookie";

const instance = axios.create({
  baseURL: "https://book-store-js-backend.onrender.com/api/v1",
});

instance.defaults.withCredentials = true;

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const headers: AxiosHeaders = config.headers as AxiosHeaders;

    if (Cookies.get("jwtoken") && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${Cookies.get("jwtoken")}`);
    }
    config.headers = headers;
    return config;
  },
  function (error: AxiosError) {
    // Do something with request error
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(error);
    if (error?.response?.status === 401 || error.status === 401) {
      Cookies.remove("jwtoken");
    }
    return Promise.reject(error);
  }
);

export default instance;
