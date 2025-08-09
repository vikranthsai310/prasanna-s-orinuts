
const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-6">
            Last updated: December 27, 2024
          </p>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using Prasanna's Orinuts website, you accept and agree to be bound by 
              the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Products and Services</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>All products are subject to availability</li>
              <li>We reserve the right to limit quantities</li>
              <li>Product images are for illustration purposes</li>
              <li>We strive to display accurate colors and descriptions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Orders and Payment</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>All orders are subject to acceptance and availability</li>
              <li>Payment must be received before shipment</li>
              <li>We accept major credit cards and digital payments</li>
              <li>Prices are subject to change without notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">User Responsibilities</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate account and ordering information</li>
              <li>Maintain the security of your account</li>
              <li>Use the website for lawful purposes only</li>
              <li>Respect intellectual property rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Contact Information</h2>
            <p>
              For questions about these Terms of Service, contact us at{' '}
              <a href="mailto:legal@prasannaorinut.com" className="text-secondary hover:underline">
                legal@prasannaorinut.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
