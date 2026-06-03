import LegalLayout from "@/app/components/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Shipping · 9924",
  description: "Return, refund, and shipping information for 9924 orders.",
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

export default function ShippingPage() {
  return (
    <LegalLayout
      eyebrow="LEGAL / 03"
      title={
        <>
          RETURNS &amp;<br />SHIPPING
        </>
      }
    >
      <p>We want you to love your 9924 purchases.</p>

      <div>
        <h2 className="font-headline font-black text-2xl sm:text-3xl uppercase tracking-tighter text-primary mt-4 mb-6 border-t border-black/5 pt-8">
          Return &amp; Refund Policy
        </h2>

        <div className="space-y-8">
          <Section title="1. Returns">
            <p>
              Returns are accepted within 14 days of delivery for unused items in original
              condition.
            </p>
          </Section>

          <Section title="2. Non-Returnable Items">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Final sale items</li>
              <li>Customized products</li>
              <li>Worn or damaged products</li>
            </ul>
          </Section>

          <Section title="3. Refunds">
            <p>Approved refunds will be processed to the original payment method.</p>
          </Section>

          <Section title="4. Exchanges">
            <p>Exchanges may be available depending on stock availability.</p>
          </Section>

          <Section title="5. Contact">
            <p>
              Email us at{" "}
              <a
                href="mailto:shop9924brand@gmail.com"
                className="text-black underline underline-offset-4 hover:opacity-70"
              >
                shop9924brand@gmail.com
              </a>{" "}
              for return requests.
            </p>
          </Section>
        </div>
      </div>

      <div>
        <h2 className="font-headline font-black text-2xl sm:text-3xl uppercase tracking-tighter text-primary mt-12 mb-6 border-t border-black/5 pt-8">
          Shipping Policy
        </h2>

        <div className="space-y-8">
          <Section title="1. Processing Time">
            <p>Orders are typically processed within 2 to 5 business days.</p>
          </Section>

          <Section title="2. Shipping Rates">
            <p>
              Domestic shipping is free. International shipping is a flat $30,
              applied at checkout.
            </p>
          </Section>

          <Section title="3. Shipping Times">
            <p>Delivery times may vary based on location and carrier.</p>
          </Section>

          <Section title="4. Tracking">
            <p>Tracking information will be sent via email once your order ships.</p>
          </Section>

          <Section title="5. Delays">
            <p>
              9924 and Ahyensode Creative Agency are not responsible for delays caused by
              carriers, weather, or customs.
            </p>
          </Section>

          <Section title="6. International Shipping">
            <p>
              International shipping is a flat $30. Customers may also be responsible for
              customs fees or import taxes charged by the destination country.
            </p>
          </Section>
        </div>
      </div>
    </LegalLayout>
  );
}
