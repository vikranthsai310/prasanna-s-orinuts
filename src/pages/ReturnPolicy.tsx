
const ReturnPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-8">Return Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-6">
            Last updated: December 27, 2024
          </p>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Return Window</h2>
            <p className="mb-4">
              Due to the nature of food products, we have a limited return policy. Returns are accepted 
              within 3 days of delivery for the following conditions:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Product received is damaged or contaminated</li>
              <li>Wrong product delivered</li>
              <li>Product quality issues (staleness, infestation)</li>
              <li>Packaging is damaged resulting in product spoilage</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Non-Returnable Items</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Products consumed or opened (unless quality issues)</li>
              <li>Products returned after 3 days</li>
              <li>Products without original packaging</li>
              <li>Custom or personalized orders</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Return Process</h2>
            <ol className="list-decimal pl-6 mb-4">
              <li>Contact our customer service within 3 days</li>
              <li>Provide order number and reason for return</li>
              <li>Take photos of the product if damaged</li>
              <li>Our team will arrange pickup or provide return instructions</li>
              <li>Refund will be processed within 5-7 business days</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Refund Method</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Original payment method (for online payments)</li>
              <li>Bank transfer (for cash on delivery)</li>
              <li>Store credit (optional, with 10% bonus value)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Quality Guarantee</h2>
            <p className="mb-4">
              We stand behind the quality of our products. If you're not satisfied with your purchase 
              due to quality issues, we'll make it right with a replacement or full refund.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              For returns and refunds, contact us at{' '}
              <a href="mailto:returns@prasannaorinut.com" className="text-secondary hover:underline">
                returns@prasannaorinut.com
              </a>{' '}
              or call +91-9876543210
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
