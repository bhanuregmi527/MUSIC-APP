import React, { useState } from "react";
import axios from "./base";
import KhaltiCheckout from "khalti-checkout-web";

import "react-toastify/dist/ReactToastify.css";

function PaymentForm() {
  const [amount, setAmount] = useState(0);

  const config = {
    // replace this key with yours
    publicKey: "test_public_key_8d18f4ecc9514345a2f52fcb549336ac",
    productIdentity: "1234567890",
    productName: "Drogon",
    productUrl: "http://localhost:6000/v1/khalti/payment",
    eventHandler: {
      onSuccess: (payload) => {
        // hit merchant api for initiating verification
        console.log(payload);
        const data = {
          token: payload.token,
          amount: amount,
        };
        axios
          .post("/khalti/payment", data)
          .then((response) => {
            console.log(response.data);
          })
          .catch((error) => {
            console.log(error);
          });
      },
      onError: (error) => {
        // handle errors
        console.log(error);
      },
      onClose: () => {
        console.log("widget is closing");
      },
    },
    paymentPreference: [
      "KHALTI",
      "EBANKING",
      "MOBILE_BANKING",
      "CONNECT_IPS",
      "SCT",
    ],
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleSubmit = (event) => {
    // minimum transaction amount must be 10, i.e 1000 in paisa.
    const checkout = new KhaltiCheckout(config);
    checkout.show({ amount: amount }); // convert to paisa
    event.preventDefault();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Amount:
          <input type="number" value={amount} onChange={handleAmountChange} />
        </label>
        <button type="submit" method="POST">
          Pay with Khalti
        </button>
      </form>
    </div>
  );
}

export default PaymentForm;