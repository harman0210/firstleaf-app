"use client";

import { MailIcon, ShieldCheck, AlertTriangle, BookOpen, Lock } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10 text-black">
      <header className="text-center">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
      </header>

      <section>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Acceptance of Terms
        </h2>
        <p className="mt-2 text-muted-foreground">
          By using FirstLeaf, you agree to these terms. If you do not agree, please do not use the platform.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" />
          User Accounts
        </h2>
        <p className="mt-2 text-muted-foreground">
          You must be at least 13 years old to create an account. You are responsible for maintaining the confidentiality of your login credentials.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          User Content & Copyright
        </h2>
        <p className="mt-2 text-muted-foreground">
          You retain full rights to your writing. By uploading to FirstLeaf, you grant us a non-exclusive license to display and promote your work on the platform.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Prohibited Conduct
        </h2>
        <ul className="list-disc ml-6 mt-2 space-y-1 text-muted-foreground">
          <li>Posting illegal, hateful, or violent content</li>
          <li>Spamming, harassment, or abusive behavior</li>
          <li>Scraping data or using bots</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Intellectual Property</h2>
        <p className="mt-2 text-muted-foreground">
          All content on FirstLeaf, excluding user-submitted works, is owned by FirstLeaf and protected by copyright and trademark laws.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Termination</h2>
        <p className="mt-2 text-muted-foreground">
          We reserve the right to suspend or delete your account if you violate these terms or engage in harmful activity on the platform.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Privacy & Data</h2>
        <p className="mt-2 text-muted-foreground">
          We care about your privacy. For more details on how your data is used, please review our <a href="/privacy" className="text-blue-600 underline">Privacy Policy</a>.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Limitation of Liability</h2>
        <p className="mt-2 text-muted-foreground">
          FirstLeaf is provided "as is" without warranties of any kind. We are not responsible for any direct or indirect damages from using the service.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Changes to Terms</h2>
        <p className="mt-2 text-muted-foreground">
          We may revise these Terms at any time. Continuing to use FirstLeaf after changes means you accept the revised terms.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Governing Law</h2>
        <p className="mt-2 text-muted-foreground">
          These terms are governed by and interpreted according to the laws of India. All disputes shall be handled in Indian courts.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <MailIcon className="w-5 h-5 text-sky-600" />
          Contact Us
        </h2>
        <p className="mt-2 text-muted-foreground">
          Have questions? Reach out at{" "}
          <a href="mailto:sharmanjot594@gmail.com" className="text-blue-600 underline">
            sharmanjot594@gmail.com
          </a>
        </p>
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toISOString().split('T')[0]}
        </p>

      </section>
    </div>
  );
}
