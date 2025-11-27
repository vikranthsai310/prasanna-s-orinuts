
const ShippingPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-8">Shipping Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-6">
            Last updated: November 28, 2025
          </p>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Shipping Coverage</h2>
            <p className="mb-4">
              We ship premium dry fruits and nuts across India through our trusted logistics partner, Shiprocket. 
              All orders are shipped from our warehouse in Hyderabad, Telangana.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Delivery Timeline</h2>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Metro Cities:</strong> 2-4 business days</li>
              <li><strong>Tier 1 & Tier 2 Cities:</strong> 3-5 business days</li>
              <li><strong>Other Areas:</strong> 5-7 business days</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              * Delivery times are estimates and may vary based on location and courier availability. 
              Orders are typically dispatched within 24 hours of payment confirmation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Shipping Charges</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Standard delivery charges apply as per your cart total</li>
              <li><strong>Free Delivery:</strong> On orders above ₹1,000</li>
              <li>Delivery fee is calculated automatically based on your location and order weight</li>
              <li>All orders are <strong>Prepaid Only</strong> - COD not available</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Premium Packaging</h2>
            <p className="mb-4">
              We ensure your dry fruits and nuts reach you fresh and intact:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Food-grade, airtight packaging to maintain freshness</li>
              <li>Secure boxing with cushioning to prevent damage</li>
              <li>Vacuum sealing for selected premium products</li>
              <li>Tamper-proof seals for your safety</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Live Order Tracking</h2>
            <p className="mb-4">
              Stay updated on your order journey:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Automatic shipment creation upon payment confirmation</li>
              <li>Real-time tracking available on our Track Order page</li>
              <li>AWB (Airway Bill) number provided for courier tracking</li>
              <li>Estimated delivery date (EDD) displayed in tracking</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Shipping Partner</h2>
            <p className="mb-4">
              We use <strong>Shiprocket</strong> logistics for reliable and efficient delivery. 
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              For shipping inquiries or support, contact us at{' '}
              <a href="mailto:prasannasorinuts@gmail.com" className="text-secondary hover:underline">
                prasannasorinuts@gmail.com
              </a>{' '}
              or call <a href="tel:+919398649506" className="text-secondary hover:underline">+91 9398649506</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
