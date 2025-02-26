import React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
} from "@react-email/components";

const styles = {
  main: {
    backgroundColor: "#f9f9f9",
    padding: "20px",
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  },
  paragraph: {
    fontSize: "16px",
    lineHeight: "24px",
    color: "#333333",
  },
};

const WelcomeTemplate = ({ userFirstname, otp }) => (
  <Html>
    <Head />
    <Preview>Your OTP for registration</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.paragraph}>Hi {userFirstname},</Text>
        <Text style={styles.paragraph}>
          Your OTP for registration is: <strong>{otp}</strong>
        </Text>
        <Text style={styles.paragraph}>
          Please enter this OTP on the registration page to complete your sign-up.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeTemplate;
