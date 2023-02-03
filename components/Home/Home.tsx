import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import axios from "../../axiosConfig";
import Header from "../header/Header";
import Footer from "./Footer";
import { useAppSelector, useAppDispatch } from "../../store/hook";
import { addBooks } from "../../store/book-slice";
import { login } from "../../store/auth-slice";

import styles from "./Home.module.css";
import { useEffect } from "react";
import { AxiosError } from "axios";

export default function Home({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.userId);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      const res = await axios.get("/auth/isAuth", {
        signal: controller.signal,
      });
      dispatch(
        login({
          isAuth: true,
          jwtoken: Cookies.get("jwtoken") as string,
          userId: res.data.userId,
          userEmail: res.data.email,
        })
      );
    })().catch((err) => {
      const error = err as AxiosError;
      if (error.response?.status === 401) {
        router.replace("/login");
      }
    });
    return () => {
      controller.abort();
    };
  }, [dispatch, router]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      const res = await axios.get("/shop/books", { signal: controller.signal });
      const books = res.data.books.map((book: any) => {
        return {
          id: book._id,
          owner: book.owner,
          name: book.name,
          price: book.price,
          imgURL: `https://book-store-js-backend.onrender.com/${book.imgURL}`,
          description: book.description,
        };
      });
      dispatch(addBooks(books));
    })().catch((err) => {
      const error = err as AxiosError;
      if (error.response?.status === 401) {
        router.replace("/login");
      }
    });

    return () => {
      controller.abort();
    };
  }, [dispatch, userId, router]);

  return (
    <body>
      <div id="backdrop-root"></div>
      <div id="overlay-root"></div>
      <Header />
      <main>{children}</main>
      <Footer />
    </body>
  );
}
