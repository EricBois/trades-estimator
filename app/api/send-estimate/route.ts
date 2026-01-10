import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resend, EMAIL_CONFIG } from "@/lib/email";
import { EstimateEmail } from "@/lib/email/templates/EstimateEmail";
import { generatePDFBuffer } from "@/lib/pdf/generator";
import { EstimatePDFData, DetailLevel } from "@/lib/pdf/types";

interface SendEstimateRequest {
  estimateId?: string;
  projectId?: string;
  recipientEmail: string;
  recipientName: string;
  recipientPhone?: string;
  projectName?: string;
  projectDescription?: string;
  rangeLow: number;
  rangeHigh: number;
  pdfData: EstimatePDFData;
  detailLevel: DetailLevel;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body: SendEstimateRequest = await request.json();

    // Validate required fields
    if (!body.recipientEmail || !body.recipientName || !body.pdfData) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: recipientEmail, recipientName, pdfData",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.recipientEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Fetch contractor profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_name, logo_url")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Could not fetch contractor profile" },
        { status: 500 }
      );
    }

    // Check if Resend is configured
    if (!resend) {
      return NextResponse.json(
        { error: "Email service not configured. Please set RESEND_API_KEY." },
        { status: 500 }
      );
    }

    // Generate PDF
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generatePDFBuffer(
        body.pdfData,
        body.detailLevel || "detailed"
      );
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      return NextResponse.json(
        { error: "Failed to generate PDF" },
        { status: 500 }
      );
    }

    // Prepare email data
    const validUntilDate = body.pdfData.validUntil
      ? new Date(body.pdfData.validUntil).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : undefined;

    // Generate filename
    const sanitizedName = body.recipientName.toLowerCase().replace(/\s+/g, "-");
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `estimate-${sanitizedName}-${dateStr}.pdf`;

    // Send email with Resend
    try {
      const emailResult = await resend.emails.send({
        from: `${profile.company_name} <${EMAIL_CONFIG.from}>`,
        to: body.recipientEmail,
        replyTo: user.email ?? undefined,
        subject: `Your Estimate from ${profile.company_name}`,
        react: EstimateEmail({
          companyName: profile.company_name,
          contractorEmail: user.email ?? "",
          logoUrl: profile.logo_url ?? undefined,
          recipientName: body.recipientName,
          projectName: body.projectName,
          projectDescription: body.projectDescription,
          rangeLow: body.rangeLow,
          rangeHigh: body.rangeHigh,
          validUntilDate,
        }),
        attachments: [
          {
            filename,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      if (emailResult.error) {
        console.error("Resend error:", emailResult.error);
        return NextResponse.json(
          { error: `Failed to send email: ${emailResult.error.message}` },
          { status: 500 }
        );
      }

      // Update estimate/project status to "sent"
      if (body.estimateId) {
        await supabase
          .from("estimates")
          .update({ status: "sent" })
          .eq("id", body.estimateId)
          .eq("contractor_id", user.id);
      }

      if (body.projectId) {
        await supabase
          .from("projects")
          .update({ status: "sent" })
          .eq("id", body.projectId)
          .eq("contractor_id", user.id);
      }

      return NextResponse.json({
        success: true,
        messageId: emailResult.data?.id,
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Send estimate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
