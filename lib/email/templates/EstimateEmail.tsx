import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface EstimateEmailProps {
  // Contractor info
  companyName: string;
  contractorEmail: string;
  contractorPhone?: string;
  logoUrl?: string;

  // Recipient info
  recipientName: string;

  // Estimate details
  projectName?: string;
  projectDescription?: string;
  rangeLow: number;
  rangeHigh: number;

  // Validity
  validUntilDate?: string;
}

export function EstimateEmail({
  companyName,
  contractorEmail,
  contractorPhone,
  logoUrl,
  recipientName,
  projectName,
  projectDescription,
  rangeLow,
  rangeHigh,
  validUntilDate,
}: EstimateEmailProps) {
  const hasRange = rangeLow !== rangeHigh;
  const formattedLow = rangeLow.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const formattedHigh = rangeHigh.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const previewText = `Your estimate from ${companyName}: ${hasRange ? `${formattedLow} - ${formattedHigh}` : formattedLow}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            {logoUrl && (
              <Img
                src={logoUrl}
                width="120"
                height="auto"
                alt={companyName}
                style={logo}
              />
            )}
            <Heading style={companyNameStyle}>{companyName}</Heading>
            <Text style={tagline}>ESTIMATE</Text>
          </Section>

          <Hr style={divider} />

          {/* Greeting */}
          <Section style={content}>
            <Text style={greeting}>Hi {recipientName},</Text>
            <Text style={paragraph}>
              Thank you for your interest in our services. Please find attached
              your detailed estimate
              {projectName ? ` for ${projectName}` : ""}.
            </Text>

            {/* Estimate Amount */}
            <Section style={amountBox}>
              <Text style={amountLabel}>
                {hasRange ? "Estimated Range" : "Estimate Total"}
              </Text>
              <Text style={amountValue}>
                {hasRange ? `${formattedLow} - ${formattedHigh}` : formattedLow}
              </Text>
            </Section>

            {/* Project Description */}
            {projectDescription && (
              <Section style={descriptionSection}>
                <Text style={descriptionLabel}>Project Notes:</Text>
                <Text style={descriptionText}>{projectDescription}</Text>
              </Section>
            )}

            {/* PDF Note */}
            <Text style={paragraph}>
              The attached PDF contains a complete breakdown of the estimate.
              Please review it at your convenience.
            </Text>

            {/* Validity */}
            {validUntilDate && (
              <Text style={validityText}>
                This estimate is valid until {validUntilDate}.
              </Text>
            )}

            {/* Call to Action */}
            <Text style={paragraph}>
              If you have any questions or would like to proceed, simply reply
              to this email or give us a call. We look forward to working with
              you!
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerCompany}>{companyName}</Text>
            <Text style={footerContact}>
              {contractorEmail}
              {contractorPhone && ` | ${contractorPhone}`}
            </Text>
            <Text style={footerNote}>
              This estimate was generated automatically. Reply to this email to
              contact us directly.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden" as const,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
};

const header = {
  backgroundColor: "#1e40af",
  padding: "32px 40px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto 16px auto",
  borderRadius: "8px",
};

const companyNameStyle = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 4px 0",
  letterSpacing: "-0.5px",
};

const tagline = {
  color: "#93c5fd",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "2px",
  margin: "0",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "0",
};

const content = {
  padding: "32px 40px",
};

const greeting = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 16px 0",
};

const paragraph = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px 0",
};

const amountBox = {
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
  border: "1px solid #dbeafe",
};

const amountLabel = {
  color: "#1e40af",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
  margin: "0 0 8px 0",
};

const amountValue = {
  color: "#1e40af",
  fontSize: "32px",
  fontWeight: "700",
  margin: "0",
  letterSpacing: "-1px",
};

const descriptionSection = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "16px",
  margin: "0 0 16px 0",
  border: "1px solid #e5e7eb",
};

const descriptionLabel = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 8px 0",
};

const descriptionText = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const validityText = {
  color: "#6b7280",
  fontSize: "14px",
  fontStyle: "italic" as const,
  margin: "0 0 16px 0",
};

const footer = {
  backgroundColor: "#f9fafb",
  padding: "24px 40px",
  textAlign: "center" as const,
};

const footerCompany = {
  color: "#1f2937",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 4px 0",
};

const footerContact = {
  color: "#6b7280",
  fontSize: "13px",
  margin: "0 0 12px 0",
};

const footerNote = {
  color: "#9ca3af",
  fontSize: "12px",
  margin: "0",
};

export default EstimateEmail;
