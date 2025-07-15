import { useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductFAQProps {
  product: {
    id: string;
    name: string;
    category: string;
  };
}

const ProductFAQ = ({ product }: ProductFAQProps) => {
  // Generate FAQs based on product type
  const faqs = [
    {
      question: `Are these ${product.name} organic?`,
      answer: `Yes, our ${product.name} are 100% organic and sourced directly from premium farms. We ensure no chemicals or preservatives are used in the growing or processing.`
    },
    {
      question: `What are the health benefits of ${product.name}?`,
      answer: `${product.name} are packed with essential nutrients including healthy fats, protein, vitamins, and minerals. They support heart health, help manage weight, and provide sustained energy throughout the day.`
    },
    {
      question: `How should I store ${product.name} after purchase?`,
      answer: `For optimal freshness, store ${product.name} in an airtight container in a cool, dry place. For longer storage (over 3 months), refrigeration is recommended to maintain quality and prevent rancidity.`
    },
    {
      question: `Do you offer bulk purchases of ${product.name}?`,
      answer: `Yes, we offer bulk purchases at special rates. Please contact our customer service for bulk order inquiries and customized packaging options.`
    },
    {
      question: `Are these ${product.name} suitable for a keto diet?`,
      answer: `Yes, our ${product.name} are excellent for keto diets as they're low in carbs and high in healthy fats, making them a perfect keto-friendly snack.`
    }
  ];

  // Add FAQ structured data
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = `faq-jsonld-${product.id}`;

    const faqStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer
        }
      }))
    };

    script.innerHTML = JSON.stringify(faqStructuredData);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById(`faq-jsonld-${product.id}`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [product.id, faqs]);

  return (
    <div className="mt-8">
      <h2 className="font-playfair text-2xl font-bold mb-4">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ProductFAQ; 