import LegalLayout from "@/app/components/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · 9924",
  description: "How 9924 and Ahyensode Creative Agency collect, use, and protect your information.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-headline font-bold text-lg sm:text-xl uppercase tracking-tight text-primary mb-3">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <LegalLayout eyebrow="LEGAL / 02" title="Privacy Policy" updated="May 13, 2026">
      <p>
        9924, operated by Ahyensode Creative Agency, respects your privacy. This Privacy Policy
        explains how we collect, use, and protect your information.
      </p>

      <Section title="1. Information We Collect">
        <p>We may collect:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Name</li>
          <li>Email address</li>
          <li>Shipping / billing information</li>
          <li>Payment details through secure payment processors</li>
          <li>Website usage analytics</li>
        </ul>
      </Section>

      <Section title="2. How We Use Your Information">
        <p>We use your information to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Process orders</li>
          <li>Improve customer experience</li>
          <li>Send updates and promotions</li>
          <li>Respond to inquiries</li>
        </ul>
      </Section>

      <Section title="3. Data Protection">
        <p>We implement reasonable security measures to protect your information.</p>
      </Section>

      <Section title="4. Third-Party Services">
        <p>
          We may use third-party services such as Shopify, Stripe, PayPal, Google Analytics, or
          email marketing tools.
        </p>
      </Section>

      <Section title="5. Your Rights">
        <p>
          You may request access, updates, or deletion of your personal information by contacting
          us.
        </p>
      </Section>

      <Section title="6. Contact">
        <p>
          Email:{" "}
          <a
            href="mailto:shop9924brand@gmail.com"
            className="text-black underline underline-offset-4 hover:opacity-70"
          >
            shop9924brand@gmail.com
          </a>
        </p>
      </Section>
    </LegalLayout>
  );
}
