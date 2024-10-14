import { Box } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";

const SubscriptionForm = ({ onSubscribe }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("EMAIL", email);
      formData.append("local", "en");
      formData.append("email_address_check", "");
      const response = await axios.post(
        "https://b459b636.sibforms.com/serve/MUIFAG-x1j_WJiiSIJUShBiK1dQKExoX8Y7YOrT-8zKvalrImaJCb_LJuZNuDUfzEzRizOFRZRdR7RCiCpOoY0yqHXZa6eWABiZW47UlCbINTGgB5mx9pHu7M_WynSaiiaR1B48Tj1rrIrHRVjxj_zosk_T12AL06OA3YB0kvn3MBluAnKCgobgmaZ4cIXvulReAoCWExzrEoFCs?isAjax=1",
        // {
        //   EMAIL: email,
        //   local: "en",
        //   email_address_check: " ",
        // }
        formData
      );
      console.log(response, "response");

      onSubscribe();
    } catch (err) {
      console.log(err);
      setError("Your subscription could not be saved. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div className="section-title text-center mb-40 mt-40">
          <h2 className="title">Subscribe to claim airdrop</h2>
        </div>
        <div
          className="sib-form"
          style={{ textAlign: "center", backgroundColor: "transparent" }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              textAlign: "center",
              backgroundColor: "rgba(26,69,120,1)",
              maxWidth: "540px",
              borderRadius: "15px",
              padding: "16px",
            }}
          >
            <h2 style={{ color: "#ffffff" }}>Airdrop Subscription</h2>
            <p style={{ color: "#b5a36c" }}>
              Subscribe to our newsletter and stay updated.
            </p>
            <div>
              <label
                htmlFor="EMAIL"
                style={{ color: "#b5a36c", fontWeight: "700" }}
              >
                Enter your email address to subscribe
              </label>
              <input
                type="email"
                id="EMAIL"
                name="EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  margin: "8px 0",
                  borderRadius: "5px",
                }}
              />
              <small style={{ color: "#b5a36c" }}>
                Provide your email address to subscribe. For e.g abc@xyz.com
              </small>
            </div>
            {error && (
              <div
                style={{
                  color: "#ff4949",
                  backgroundColor: "#ffeded",
                  borderRadius: "3px",
                  padding: "8px",
                }}
              >
                {error}
              </div>
            )}
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                borderRadius: "20px",
                backgroundColor: "#ffffff",
                color: "#000000",
                fontWeight: "700",
                marginTop: "16px",
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "SUBSCRIBING..." : "SUBSCRIBE"}
            </button>
          </form>
        </div>
      </Box>
    </>
  );
};

export default SubscriptionForm;
