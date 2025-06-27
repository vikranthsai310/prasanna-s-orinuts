
const ShippingPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-8">Shipping Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-6">
            Last updated: December 27, 2024
          </p>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Shipping Areas</h2>
            <p className="mb-4">
              We currently ship to all major cities across India. Remote areas may have additional 
              delivery time and charges.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Delivery Time</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Metro cities: 2-3 business days</li>
              <li>Tier 2 cities: 3-5 business days</li>
              <li>Remote areas: 5-7 business days</li>
              <li>Express delivery available for metro cities (1-2 days)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Shipping Charges</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Free shipping on orders above ₹500</li>
              <li>Standard shipping: ₹50 for orders below ₹500</li>
              <li>Express delivery: Additional ₹100</li>
              <li>Cash on delivery: Additional ₹25</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Packaging</h2>
            <p className="mb-4">
              All products are carefully packaged to ensure freshness and prevent damage during transit. 
              We use food-grade packaging materials and vacuum sealing where appropriate.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Order Tracking</h2>
            <p className="mb-4">
              Once your order is shipped, you'll receive a tracking number via SMS and email. 
              You can track your order status on our website or through our delivery partner's portal.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              For shipping inquiries, contact us at{' '}
              <a href="mailto:shipping@prasannaorinut.com" className="text-secondary hover:underline">
                shipping@prasannaorinut.com
              </a>{' '}
              or call +91-9876543210
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
