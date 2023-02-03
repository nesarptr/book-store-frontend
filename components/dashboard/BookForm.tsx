import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useAppDispatch, useAppSelector } from "../../store/hook";
import { addBook, updateBook } from "../../store/book-slice";
import axios from "../../axiosConfig";
import LineError from "../error/LineError";

import styles from "./BookForm.module.css";
import inputStyles from "../auth/input.module.css";

type BookFormProps = {
  adminData?: { isAdmin: boolean; id: string };
};

const signupFormSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .required("Name is required")
      .min(2, "Name has to be atleast 2 character long"),
    price: yup
      .number()
      .required("Price is required")
      .min(0.1, "Price has to be grater than zero"),
    description: yup
      .string()
      .trim()
      .required("Description is required")
      .min(10, "Description has to be atleast 10 character long"),
    image: yup
      .mixed()
      .notRequired()
      .test(
        "fileSize",
        "this file is too large. please upload an image with 1mb or less size",
        (value) => {
          if (!value || value?.length < 1) {
            return true;
          }
          return value[0].size <= 1000000;
        }
      )
      .test("fileType", "Unsupported file type", (value) => {
        if (!value || value?.length < 1) {
          return true;
        }
        return (
          value[0].type === "image/jpeg" ||
          value[0].type === "image/jpg" ||
          value[0].type === "image/png"
        );
      }),
  })
  .required("invalid value");

export default function BookForm({ adminData }: BookFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const book = useAppSelector((state) =>
    state.book.books.find((book) => book.id === adminData?.id)
  );
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(signupFormSchema) });

  const submitHandler = handleSubmit(async (user) => {
    console.error(user);
    const data = new FormData();
    data.append("name", user.name);
    data.append("price", user.price);
    data.append("description", user.description);
    user.image?.length > 0 && data.append("image", user.image[0]);
    try {
      if (adminData?.isAdmin) {
        const res = await axios.put(`/admin/book/${book?.id}`, data);
        dispatch(
          updateBook({
            id: res.data._id,
            description: res.data.description,
            name: res.data.name,
            imgURL: `https://book-store-js-backend.onrender.com/${res.data.imgURL}`,
            price: res.data.price,
            owner: res.data.owner,
          })
        );
      } else {
        const res = await axios.post("/admin/book", data);
        dispatch(
          addBook({
            id: res.data.data._id,
            description: res.data.data.description,
            name: res.data.data.name,
            imgURL: `https://book-store-js-backend.onrender.com/${res.data.data.imgURL}`,
            price: res.data.data.price,
            owner: res.data.data.owner,
          })
        );
      }
      // router.push("/");
    } catch (err) {
      const error = err as AxiosError;
      if (error.response?.status === 401) {
        router.replace("/login");
      }
    } finally {
      reset();
    }
  });

  return (
    <div className={styles.main}>
      <form className={styles.form} onSubmit={submitHandler}>
        {errors.name?.message && (
          <LineError message={errors.name.message as string} />
        )}
        <input
          type="text"
          id="name"
          placeholder="Name"
          defaultValue={adminData?.isAdmin ? book?.name : ""}
          className={inputStyles.input}
          {...register("name")}
        />
        {errors.price?.message && (
          <LineError message={errors.price.message as string} />
        )}
        <input
          type="number"
          id="price"
          placeholder="Price"
          defaultValue={adminData?.isAdmin ? book?.price : ""}
          className={inputStyles.input}
          {...register("price")}
        />
        {errors.description?.message && (
          <LineError message={errors.description.message as string} />
        )}
        <textarea
          id={styles.description}
          placeholder="Describe your book"
          defaultValue={adminData?.isAdmin ? book?.description : ""}
          className={inputStyles.input}
          {...register("description")}
        />
        {errors.image?.message && (
          <LineError message={errors.image.message as string} />
        )}
        <input
          type="file"
          id="image"
          placeholder="Pick an Image"
          className={inputStyles.input}
          {...register("image")}
        />
        <button type="submit" className={inputStyles.submit}>
          {adminData?.isAdmin ? "Update Book" : "Add Book"}
        </button>
      </form>
    </div>
  );
}
