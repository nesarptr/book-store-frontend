import { NextResponse } from "next/server";
import axios, { AxiosError, AxiosHeaders } from "axios";
import Cookies from "js-cookie";

const instance = axios.create({
  baseURL: "https://manage-inventory.onrender.com/api/v1",
});

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const headers: AxiosHeaders = config.headers as AxiosHeaders;
    config.withCredentials = true;

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
    console.log(error);
    if (error?.response?.status === 401 || error.status === 401) {
      Cookies.remove("jwtoken");
    }
    return Promise.reject(error);
  }
);

export default instance;
