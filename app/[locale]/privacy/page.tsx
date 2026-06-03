import Script from "next/script";
import Link from "next/link";

export default function CookiesPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">
        Cookie Policy
      </h1>

      <p className="text-gray-600 mb-6">
        This Cookie Policy explains how Esthetic Match uses cookies and
        similar technologies to recognize you when you visit our website.
      </p>

      <div className="space-y-4 text-gray-700 leading-7">
        <p>
          We use cookies to:
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>Keep you signed in securely</li>
          <li>Remember your preferences</li>
          <li>Analyze website traffic and performance</li>
          <li>Improve user experience</li>
          <li>Support payment and authentication functionality</li>
        </ul>

        <p>
          You can change or withdraw your consent at any time using the
          cookie preferences dialog available on our website.
        </p>

        <p>
          For more information about how we process personal data, please
          review our{" "}
          <Link
            href="/privacy"
            className="underline"
          >
            Privacy Policy
          </Link>.
        </p>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">
          Cookie Declaration
        </h2>

        <Script
          id="CookieDeclaration"
          src="https://consent.cookiebot.com/1f821395-7c93-4bc1-a077-36d1d1ef9aa9/cd.js"
          strategy="lazyOnload"
        />
      </div>
    </main>
  );
}