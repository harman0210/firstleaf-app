// app/privacy-policy/page.tsx
export default function PrivacyPolicyPage() {
  return (
    <div className="prose mx-auto p-6">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>This Privacy Policy describes how FirstLeaf (“we”, “us”, or “our”) collects, uses, and discloses your personal information.</p>

      <h2>Information We Collect</h2>
      <ul>
        <li><strong>Account information:</strong> Email, name (if provided).</li>
        <li><strong>Usage data:</strong> Pages visited, IP address, browser type.</li>
        <li><strong>Cookies:</strong> For login and preferences.</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To provide and maintain our services.</li>
        <li>To manage your account and support user authentication.</li>
        <li>To improve the platform based on feedback and analytics.</li>
      </ul>

      <h2>Third-Party Services</h2>
      <p>We use Supabase for authentication and data storage. We may use analytics tools (like Vercel Analytics or Google Analytics) which collect usage data.</p>

      <h2>Cookies and Tracking</h2>
      <p>We use essential cookies for login and site navigation. You may disable cookies, but it may affect functionality.</p>

      <h2>Changes to This Policy</h2>
      <p>We may update this policy from time to time. We will notify changes via email or site banner.</p>

      <h2>Contact Us</h2>
      <p>If you have questions, please email us at <a href="mailto:your@email.com">sharmanjot594@email.com</a>.</p>
    </div>
  );
}
