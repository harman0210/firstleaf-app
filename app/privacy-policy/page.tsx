// app/privacy-policy/page.tsx
'use client';
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
  return (
    <section className="max-w-3xl mx-auto p-6 md:p-12 bg-white dark:bg-zinc-900 shadow-xl rounded-2xl transition-all duration-300">
      <article className="prose prose-zinc dark:prose-invert">
        {/* Your content here */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold mb-4 text-center"
        >
          Privacy Policy
        </motion.h1>
        <p>
          FirstLeaf (“we,” “our,” or “us”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, share, and safeguard your personal information when you use our platform.
        </p>

        <h2>1. Information We Collect</h2>
        <ul>
          <li><strong>Account Information:</strong> Your email address, display name, profile details.</li>
          <li><strong>User-Generated Content:</strong> Stories, poems, comments, and any other submissions.</li>
          <li><strong>Usage Data:</strong> Pages visited, reading time, IP address, device/browser information.</li>
          <li><strong>Cookies and Tracking Technologies:</strong> Used for authentication, preferences, and analytics.</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To provide, maintain, and improve our services.</li>
          <li>To support user authentication and account management.</li>
          <li>To personalize your experience on the platform.</li>
          <li>To respond to user inquiries and support requests.</li>
          <li>To analyze usage trends and improve performance.</li>
        </ul>

        <h2>3. Data Sharing and Third Parties</h2>
        <p>We do not sell your data. We only share necessary information with trusted third-party services, such as:</p>
        <ul>
          <li><strong>Supabase:</strong> For authentication and database services.</li>
          <li><strong>Analytics Tools:</strong> (e.g., Vercel Analytics, Google Analytics) to monitor site usage.</li>
          <li><strong>Legal Compliance:</strong> If required by law, we may disclose data to comply with legal obligations.</li>
        </ul>

        <h2>4. Data Retention</h2>
        <p>We retain your data for as long as your account is active, or as needed to provide services, comply with legal obligations, or resolve disputes.</p>

        <h2>5. Your Rights</h2>
        <p>You may have rights under data protection laws, including:</p>
        <ul>
          <li>Accessing or correcting your personal data.</li>
          <li>Requesting deletion of your account or data.</li>
          <li>Objecting to certain uses of your data.</li>
        </ul>
        <p>To exercise these rights, please contact us at <a href="mailto:sharmanjot594@gmail.com">sharmanjot594@gmail.com</a>.</p>

        <h2>6. Data Security</h2>
        <p>We implement industry-standard security measures to protect your information. However, no system is completely secure. Please keep your login credentials confidential.</p>

        <h2>7. International Data Transfers</h2>
        <p>If you are located outside India, your information may be transferred to and processed in India where our servers are located. By using our services, you consent to this transfer.</p>

        <h2>8. Children’s Privacy</h2>
        <p>Our platform is not intended for children under the age of 13. We do not knowingly collect personal information from children without parental consent. If we learn we have collected such data, we will delete it promptly.</p>

        <h2>9. Changes to This Privacy Policy</h2>
        <p>We may update this policy periodically. Changes will be posted on this page with an updated date. For significant changes, we may notify you via email or banner on the site.</p>

        <h2>10. Contact Us</h2>
        <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
        <ul>
          <a
            href="mailto:sharmanjot594@email.com"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            sharmanjot594@email.com
          </a>

          <li>Subject: Privacy Inquiry</li>
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        </ul>
      </article>
    </section>
  );
}
