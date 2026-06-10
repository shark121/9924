import { getShippingPolicy } from "@/lib/shipping";
import { getSetting } from "@/lib/settings-db";
import { PW_OVERRIDE_KEY } from "@/lib/auth";
import { PasswordForm, ShippingForm } from "./SettingsForms";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [policy, override] = await Promise.all([
    getShippingPolicy(),
    getSetting(PW_OVERRIDE_KEY),
  ]);
  const hasOverride = !!override;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-headline text-xl font-bold tracking-tight text-neutral-900">
        Settings
      </h1>
      <p className="mt-1 text-sm text-neutral-500">Store configuration</p>

      <div className="mt-6 flex flex-col gap-4">
        <ShippingForm
          intlFlatUsd={policy.intlFlatCents / 100}
          originCountry={policy.originCountry}
        />
        <PasswordForm hasOverride={hasOverride} />
      </div>
    </div>
  );
}
