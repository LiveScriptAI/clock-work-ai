
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutButton } from "@/components/checkout/CheckoutButton";
import { Check } from "lucide-react";

const features = [
  "Real-time shift tracking",
  "Custom branded invoices",
  "Daily, weekly, and monthly earnings reports",
  "Downloadable CSV & PDF exports",
  "Send timesheets via WhatsApp, email, etc.",
  "Secure cloud storage",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2ff] to-white px-4 py-12 font-body">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-display text-brand-navy mb-4">
          Unlock Clock Work Pal Pro
        </h1>
        <p className="text-lg text-gray-700 mb-10">
          Start your <strong>7-day free trial</strong> — no credit card required. Cancel anytime.
        </p>

        <Card className="shadow-xl border border-brand-accent bg-white">
          <CardHeader>
            <CardTitle className="text-3xl text-brand-navy">£3.99 / month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-2 text-left text-sm text-gray-700">
              {features.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="text-green-500 w-5 h-5 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <CheckoutButton className="w-full h-12 text-lg" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Cancel anytime during trial. No hidden fees.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
