// app/contact/page.tsx
export default function ContactPage() {
  return (
    <div className="prose mx-auto p-6">
      <h1>Contact Us</h1>
      <p>Have a question, feedback, or issue? We’re here to help.</p>
      <ul>
        <li>Email: <a href="mailto:@email.com">sharmanjot594@gmail.com</a></li>
       {/* <li>Twitter: <a href="https://twitter.com/yourhandle">@yourhandle</a></li>*/}
      </ul>
      <p>We’ll try to respond within 48 hours.</p>
    </div>
  );
}
