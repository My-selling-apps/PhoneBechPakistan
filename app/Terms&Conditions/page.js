import Navbar from '../components/Navbar'; // Import your Navbar component
import Footer from '../components/Footer'; // Import your Footer component

export default function TermsAndConditions() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl  text-center mb-8">Terms and Conditions</h1>

        <div className=" max-w-4xl mx-auto">
          <h2 className="text-2xl  mt-6">1. Introduction</h2>
          <p>
            Welcome to <strong>PhonebechPK.com</strong> (referred to as "the Website"). By accessing or using this Website, you agree to comply with and be bound by these Terms and Conditions. If you do not agree with these terms, please refrain from using the Website.
          </p>

          <h2 className="text-2xl  mt-6">2. Eligibility</h2>
          <p>
            Users must be at least <strong>18 years old</strong> or have parental/guardian consent to use this Website. By using the Website, you confirm that you meet the eligibility requirements.
          </p>

          <h2 className="text-2xl  mt-6">3. Account Registration</h2>
          <p>
            To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate and complete information during registration.
          </p>

          <h2 className="text-2xl  mt-6">4. Product Listings and Purchases</h2>
          <p>
            All products listed on the Website are subject to availability. Prices are subject to change without notice. By placing an order, you agree to pay the specified price and any applicable taxes or fees. The Website reserves the right to cancel or refuse any order at its discretion.
          </p>

          <h2 className="text-2xl  mt-6">5. Payment and Refunds</h2>
          <p>
            Payment methods accepted will be displayed at checkout. Refunds or returns are subject to the Website’s <a href="/refund-policy" className="text-blue-500 hover:underline">Refund Policy</a>. Chargebacks or disputes without prior communication with the Website may result in account suspension.
          </p>

          <h2 className="text-2xl  mt-6">6. User Responsibilities</h2>
          <p>
            You agree not to use the Website for any illegal or unauthorized purposes. You must not upload harmful content, spam, or engage in fraudulent activities. Any misuse of the Website may result in account termination.
          </p>

          <h2 className="text-2xl  mt-6">7. Intellectual Property</h2>
          <p>
            All content on the Website (logos, text, images, etc.) is the property of <strong>PhonebechPK.com</strong> and is protected by copyright laws. Unauthorized use of any content is strictly prohibited.
          </p>

          <h2 className="text-2xl  mt-6">8. Limitation of Liability</h2>
          <p>
            The Website is not liable for any damages or losses arising from the use of the Website or products purchased through it. The Website does not guarantee the accuracy or reliability of third-party content or links.
          </p>

          <h2 className="text-2xl  mt-6">9. Privacy Policy</h2>
          <p>
            Your use of the Website is also governed by our <a href="/privacy-policy" className="text-blue-500 hover:underline">Privacy Policy</a>, which explains how we collect, use, and protect your data.
          </p>

          <h2 className="text-2xl  mt-6">10. Termination</h2>
          <p>
            The Website reserves the right to suspend or terminate your account at any time for violations of these Terms and Conditions.
          </p>

          <h2 className="text-2xl  mt-6">11. Governing Law</h2>
          <p>
            These Terms and Conditions are governed by the laws of <strong>Pakistan</strong>. Any disputes will be resolved in the courts of Pakistan.
          </p>

          <h2 className="text-2xl  mt-6">12. Changes to Terms and Conditions</h2>
          <p>
            The Website reserves the right to update or modify these Terms and Conditions at any time. Continued use of the Website after changes constitutes acceptance of the updated terms.
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}