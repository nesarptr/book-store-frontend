import { useRouter } from "next/navigation";
import { PaymentElement } from "@stripe/react-stripe-js";
import { FormEventHandler, useState } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";

import axios from "../../axiosConfig";

import styles from "./CheckoutForm.module.css";
import { useAppDispatch } from "../../store/hook";
import { changeStatus } from "../../store/order-slice";

export default function CheckoutForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string>();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/orders`,
      },
      redirect: "if_required",
    });

    if (error?.type === "card_error" || error?.type === "validation_error") {
      setMessage(error?.message as string);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      axios
        .put(`/shop/pay/${paymentIntent.id}`)
        .then((res) => {
          if (res.status === 200) {
            dispatch(changeStatus(res.data.id));
          }
        })
        .catch((e) => console.error(e));
      router.push("/orders");
    } else {
      setMessage("An unexpected error occured.");
    }

    setIsProcessing(false);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button type="submit" disabled={isProcessing || !stripe || !elements}>
        <span>{isProcessing ? "Processing ... " : "Pay now"}</span>
      </button>
      {/* Show any error or success messages */}
      {message && <p>{message}</p>}
    </form>
  );
}
