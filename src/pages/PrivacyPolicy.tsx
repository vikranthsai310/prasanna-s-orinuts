
const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-6">
            Last updated: November 28, 2024
          </p>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              make a purchase, or contact us for support.
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Personal information (name, email, phone number)</li>
              <li>Shipping and billing addresses</li>
              <li>Payment information</li>
              <li>Order history and preferences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Provide customer support</li>
              <li>Improve our products and services</li>
              <li>Send promotional emails (with your consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Information Sharing</h2>
            <p className="mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share 
              your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>With shipping companies to deliver your orders</li>
              <li>With payment processors to handle transactions</li>
              <li>When required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:prasannasorinuts@gmail.com" className="text-secondary hover:underline">
                prasannasorinuts@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
