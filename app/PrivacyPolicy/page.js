import Navbar from '../components/Navbar'; // Import your Navbar component
import Footer from '../components/Footer'; // Import your Footer component

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Privacy Policy</h1>

        <div className="prose max-w-4xl mx-auto">
          <p className="mb-6">
            At <strong>PhonebechPK.com</strong>, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you use our website.
          </p>

          <h2 className="text-2xl font-semibold mt-6">1. Information We Collect</h2>
          <p>
            We may collect the following types of information when you use our website:
          </p>
          <ul className="list-disc pl-6">
            <li><strong>Personal Information:</strong> Name, email address, phone number, and shipping address.</li>
            <li><strong>Payment Information:</strong> Credit/debit card details or other payment information (processed securely by third-party payment gateways).</li>
            <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers.</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent on the site, and interactions with the website.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6">2. How We Use Your Information</h2>
          <p>
            We use the information we collect for the following purposes:
          </p>
          <ul className="list-disc pl-6">
            <li>To process and fulfill your orders.</li>
            <li>To improve our website and services.</li>
            <li>To communicate with you about your orders, promotions, and updates.</li>
            <li>To prevent fraud and ensure the security of our platform.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6">3. Sharing Your Information</h2>
          <p>
            We do not sell or rent your personal information to third parties. However, we may share your information with:
          </p>
          <ul className="list-disc pl-6">
            <li><strong>Service Providers:</strong> Third-party vendors who assist us in operating our website, processing payments, or delivering products.</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and property.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-semibold mt-6">5. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and personalize content. You can manage your cookie preferences through your browser settings.
          </p>

          <h2 className="text-2xl font-semibold mt-6">6. Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul className="list-disc pl-6">
            <li>Access, update, or delete your personal information.</li>
            <li>Opt-out of receiving promotional communications.</li>
            <li>Request a copy of the data we hold about you.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6">7. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page, and we encourage you to review it periodically.
          </p>

          <h2 className="text-2xl font-semibold mt-6">8. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy, please contact us at:
          </p>
          <ul className="list-disc pl-6">
            <li><strong>Email:</strong> support@phonebechpk.com</li>
            <li><strong>Phone:</strong> +92 123 456 7890</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}