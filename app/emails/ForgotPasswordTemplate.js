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
  otpText: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#4a4a4a",
    textAlign: "center",
    margin: "20px 0",
  },
  footer: {
    marginTop: "20px",
    fontSize: "12px",
    color: "#777777",
  }
};

const ForgotPasswordTemplate = ({ userFirstname, otp }) => (
  <Html>
    <Head />
    <Preview>Your Password Reset OTP</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Text style={styles.paragraph}>Hi {userFirstname},</Text>
        <Text style={styles.paragraph}>
          You have requested to reset your password. Use the following One-Time Password (OTP) to complete the process:
        </Text>
        <Text style={styles.otpText}>{otp}</Text>
        <Text style={styles.paragraph}>
          This OTP is valid for 10 minutes. Do not share this code with anyone.
        </Text>
        <Text style={styles.paragraph}>
          If you did not request a password reset, please ignore this email or contact support if you have concerns.
        </Text>
        <Text style={styles.footer}>
          Best regards,<br />
          Your Application Support Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ForgotPasswordTemplate;