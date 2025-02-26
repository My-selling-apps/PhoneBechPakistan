import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import ForgotPasswordTemplate from "../../emails/ForgotPasswordTemplate";
import { Resend } from "resend";
import { supabase } from "../../supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email, userFirstname, otp } = await request.json();

    // Add delay to prevent rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if user exists - Modified this part
    // Check if user exists - Modified this part
    const { data: userExistsData, error: userError } =
      await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false,
        },
      });

    // Add this check after getting userExistsData
    if (!userExistsData || userError) {
      console.error("User check failed:", userError);
      return NextResponse.json(
        { error: "No account found with this email" }, // Better error message
        { status: 404 } // Changed status to 404 for "not found"
      );
    }

    // Store OTP in Supabase
    const { error: otpError } = await supabase
      .from("forgot_password_otp")
      .insert([
        {
          email,
          otp,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        },
      ]);

    if (otpError) {
      console.error("Failed to store OTP:", otpError);
      return NextResponse.json(
        { error: "Failed to store OTP" },
        { status: 500 }
      );
    }

    // Send email
    // Send email
    const emailHtml = render(
      ForgotPasswordTemplate({
        userFirstname: userFirstname || email.split("@")[0],
        otp,
      })
    );

    // Convert the rendered HTML to string
    const htmlString = emailHtml.toString();

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "PhoneBach <onboarding@resend.dev>",
      to: [email],
      subject: "Your Password Reset OTP",
      html: htmlString, // Using the converted string here
    });
    if (emailError) {
      console.error("Failed to send email:", emailError);
      return NextResponse.json(
        { error: "Failed to send OTP email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Password reset OTP sent successfully",
      success: true,
    });
  } catch (error) {
    console.error("Password reset failed:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
