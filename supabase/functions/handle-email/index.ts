
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, url, username } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    let emailResponse;
    
    if (type === "welcome") {
      // Send welcome email
      emailResponse = await resend.emails.send({
        from: "FiggyTales <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to FiggyTales!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f97316;">Welcome to FiggyTales!</h1>
            <p>Hello ${username || "there"},</p>
            <p>Thank you for joining FiggyTales! We're excited to help you transform your design screens into meaningful user stories.</p>
            <p>Get started by uploading your design files and generating stories.</p>
            <p>Best regards,<br>The FiggyTales Team</p>
          </div>
        `,
      });
    } else if (type === "verification") {
      // Send verification email
      emailResponse = await resend.emails.send({
        from: "FiggyTales <onboarding@resend.dev>",
        to: [email],
        subject: "Verify your FiggyTales account",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f97316;">Verify your Email</h1>
            <p>Hello ${username || "there"},</p>
            <p>Thank you for signing up for FiggyTales. Please verify your email address to continue.</p>
            <p><a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #f97316; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a></p>
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p>${url}</p>
            <p>Best regards,<br>The FiggyTales Team</p>
          </div>
        `,
      });
    } else if (type === "reset") {
      // Send password reset email
      emailResponse = await resend.emails.send({
        from: "FiggyTales <onboarding@resend.dev>",
        to: [email],
        subject: "Reset your FiggyTales password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f97316;">Reset Your Password</h1>
            <p>Hello there,</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <p><a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #f97316; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p>${url}</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <p>Best regards,<br>The FiggyTales Team</p>
          </div>
        `,
      });
    } else {
      throw new Error("Invalid email type");
    }

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
