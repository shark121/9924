import LegalLayout from "@/app/components/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — 9924",
  description: "Terms & Conditions for 9924, operated by Ahyensode Creative Agency.",
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

export default function TermsPage() {
  return (
    <LegalLayout eyebrow="LEGAL / 01" title="Terms & Conditions" updated="May 13, 2026">
      <p>
        Welcome to 9924. This website is operated by Ahyensode Creative Agency on behalf of 9924.
        By accessing or using our website, you agree to comply with and be bound by the following
        Terms &amp; Conditions.
      </p>

      <Section title="1. General">
        <p>
          Throughout the site, the terms &ldquo;we,&rdquo; &ldquo;us,&rdquo; and &ldquo;our&rdquo;
          refer to 9924 and Ahyensode Creative Agency.
        </p>
        <p>
          By visiting our site and/or purchasing something from us, you agree to these Terms &amp;
          Conditions.
        </p>
      </Section>

      <Section title="2. Products & Pricing">
        <p>
          All products are subject to availability. We reserve the right to modify or discontinue
          products at any time without notice.
        </p>
        <p>Prices for our products are subject to change without notice.</p>
      </Section>

      <Section title="3. Intellectual Property">
        <p>
          All content on this website, including logos, graphics, designs, text, images, and
          branding, is the property of 9924 and Ahyensode Creative Agency and may not be copied,
          reproduced, or used without permission.
        </p>
      </Section>

      <Section title="4. Payments">
        <p>
          We reserve the right to refuse or cancel orders if fraud or unauthorized activity is
          suspected.
        </p>
      </Section>

      <Section title="5. Returns & Refunds">
        <p>
          Please review our{" "}
          <a href="/shipping" className="text-black underline underline-offset-4 hover:opacity-70">
            Return &amp; Refund Policy
          </a>{" "}
          for information regarding returns, exchanges, and refunds.
        </p>
      </Section>

      <Section title="6. Limitation of Liability">
        <p>
          9924 and Ahyensode Creative Agency shall not be liable for any indirect, incidental, or
          consequential damages arising from the use of our website or products.
        </p>
      </Section>

      <Section title="7. Changes to Terms">
        <p>
          We reserve the right to update or replace these Terms &amp; Conditions at any time.
        </p>
      </Section>

      <Section title="8. Contact Information">
        <p>
          Email:{" "}
          <a
            href="mailto:shop9924brand@gmail.com"
            className="text-black underline underline-offset-4 hover:opacity-70"
          >
            shop9924brand@gmail.com
          </a>
        </p>
        <p>
          Instagram:{" "}
          <a
            href="https://www.instagram.com/9924brand"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black underline underline-offset-4 hover:opacity-70"
          >
            @9924brand
          </a>
        </p>
      </Section>
    </LegalLayout>
  );
}
