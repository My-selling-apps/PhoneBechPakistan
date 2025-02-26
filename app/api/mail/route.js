import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import WelcomeTemplate from "../../emails/WelcomeTemplate"; // Ensure correct import
import { Resend } from "resend";
import { supabase } from "../../supabase"; // Ensure correct path for Supabase client

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email, userFirstname, password, phoneNumber } = await request.json();
    
    console.log("Request received:", { email, userFirstname, password, phoneNumber });

    // Step 1: Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Step 2: Store OTP in `otp_table`
    const { error: otpError } = await supabase
      .from("otp_table")
      .insert([{ email, otp }]);

    if (otpError) {
      console.error("Failed to store OTP:", otpError);
      return NextResponse.json({ error: "Failed to store OTP" }, { status: 500 });
    }

    // Step 3: Store user data in `temp_users`
    const { error: tempUserError } = await supabase
      .from("temp_users")
      .insert([{ email, password, phone_number: phoneNumber }]);

    if (tempUserError) {
      console.error("Failed to store temporary user data:", tempUserError);
      return NextResponse.json({ error: "Failed to store temporary user data" }, { status: 500 });
    }

    // Step 4: Render the email template
    const emailHtml = await render(WelcomeTemplate({ userFirstname, otp })); // Await the render function

    // Debugging: Log the rendered HTML
    console.log("Rendered HTML:", emailHtml);

    // Step 5: Send OTP via email
    const { data, error: emailError } = await resend.emails.send({
      from: "PhoneBechpk <noreply@phonebechpk.com>", // or any other email@phonebechpk.com
      to: [email],
      subject: "Your OTP for Registration",
      html: emailHtml, // Ensure this is a string
    });

    if (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 });
    }

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Mail sending failed:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}