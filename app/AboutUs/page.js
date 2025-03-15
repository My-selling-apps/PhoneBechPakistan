import Navbar from '../components/Navbar'; // Import your Navbar component
import Footer from '../components/Footer'; // Import your Footer component

export default function AboutUs() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">About Us</h1>

        <div className="prose max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mt-6">Welcome to PhonebechPK.com</h2>
          <p>
            At <strong>PhonebechPK.com</strong>, we are passionate about connecting people with the best mobile devices at affordable prices. Our mission is to make buying and selling phones simple, secure, and hassle-free for everyone in Pakistan.
          </p>

          <h2 className="text-2xl font-semibold mt-6">Who We Are</h2>
          <p>
            PhonebechPK.com is a trusted online marketplace dedicated to providing a seamless experience for buying and selling pre-owned and new mobile phones. Whether you're looking for the latest smartphone or want to sell your old device, we’ve got you covered.
          </p>

          <h2 className="text-2xl font-semibold mt-6">Our Vision</h2>
          <p>
            Our vision is to become Pakistan’s go-to platform for mobile phone transactions. We aim to create a community where buyers and sellers can interact with confidence, knowing that their transactions are safe and transparent.
          </p>

          <h2 className="text-2xl font-semibold mt-6">Why Choose Us?</h2>
          <ul className="list-disc pl-6">
            <li><strong>Wide Selection:</strong> Explore a vast collection of new and used phones from top brands.</li>
            <li><strong>Secure Transactions:</strong> We ensure safe and reliable payment methods for all transactions.</li>
            <li><strong>Quality Assurance:</strong> Every phone listed on our platform undergoes a thorough verification process.</li>
            <li><strong>Customer Support:</strong> Our dedicated support team is here to assist you at every step.</li>
            <li><strong>Easy Selling:</strong> Sell your phone quickly and get the best value for your device.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6">Our Commitment</h2>
          <p>
            We are committed to providing our customers with the best possible experience. From browsing to checkout, we strive to make every interaction with PhonebechPK.com smooth and enjoyable. Your satisfaction is our top priority.
          </p>

          <h2 className="text-2xl font-semibold mt-6">Join Our Community</h2>
          <p>
            Become a part of the PhonebechPK.com community today! Whether you're a buyer or a seller, we welcome you to explore our platform and experience the convenience of online phone trading.
          </p>

          <p className="mt-6">
            Thank you for choosing <strong>PhonebechPK.com</strong>. We look forward to serving you!
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}