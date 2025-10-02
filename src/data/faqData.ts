export const faqData = {
  general: [
    {
      question: "Where can I buy premium dry fruits online in India?",
      answer: "You can buy premium quality dry fruits online at Prasanna's Orinuts. We offer fresh California almonds, jumbo cashews, Kashmir walnuts, Afghani dates, and more with free shipping on orders above ₹500."
    },
    {
      question: "Are your dry fruits 100% natural and organic?",
      answer: "Yes! All our dry fruits are 100% natural with no additives, preservatives, or artificial colors. We source directly from premium farms to ensure the highest quality."
    },
    {
      question: "Do you offer free shipping on dry fruits?",
      answer: "Yes, we offer free shipping on all orders above ₹500 across India. For orders below ₹500, minimal shipping charges apply."
    },
    {
      question: "How fresh are the dry fruits?",
      answer: "We ensure maximum freshness by sourcing directly from farms and storing them in optimal conditions. All our dry fruits are packed fresh on order to maintain their natural taste and nutritional value."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major payment methods including Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery for added convenience."
    }
  ],
  products: [
    {
      question: "Which dry fruits are best for daily consumption?",
      answer: "Almonds, walnuts, and cashews are excellent for daily consumption. We recommend eating 4-5 almonds, 2-3 walnuts, and a handful of cashews daily for optimal health benefits."
    },
    {
      question: "What is the price of almonds per kg?",
      answer: "Premium California almonds start from ₹299 for 250g (₹1196/kg). Prices vary based on quality and quantity. Check our products page for current offers."
    },
    {
      question: "Are Kashmir walnuts better than regular walnuts?",
      answer: "Yes, Kashmir walnuts are known for superior quality, richer taste, and higher omega-3 content compared to regular walnuts. They have thinner shells and larger kernels."
    },
    {
      question: "Which dates are the sweetest?",
      answer: "Afghani dates are naturally sweet and soft, making them perfect for direct consumption. They're rich in natural sugars and essential minerals."
    },
    {
      question: "Can I buy dry fruits in bulk for wholesale?",
      answer: "Yes! We offer wholesale prices for bulk orders. Contact us for special bulk pricing on orders above 5kg."
    }
  ],
  health: [
    {
      question: "Which dry fruits are best for weight loss?",
      answer: "Almonds, walnuts, and pistachios are excellent for weight loss as they're high in protein and healthy fats that keep you full longer. Consume in moderation (1 handful daily)."
    },
    {
      question: "Are dry fruits good for diabetes?",
      answer: "Yes, almonds and walnuts have a low glycemic index and can help regulate blood sugar. However, limit dried fruits like dates and raisins. Always consult your doctor for personalized advice."
    },
    {
      question: "Which dry fruits boost immunity?",
      answer: "Almonds, walnuts, and cashews are rich in Vitamin E, zinc, and antioxidants that boost immunity. Regular consumption helps strengthen your immune system."
    },
    {
      question: "Can pregnant women eat dry fruits?",
      answer: "Yes! Dry fruits are highly nutritious for pregnant women. Almonds provide folic acid, dates provide iron, and walnuts provide omega-3. Consult your gynecologist for the right quantity."
    },
    {
      question: "Which dry fruits are best for brain health?",
      answer: "Walnuts are the #1 choice for brain health due to high omega-3 content. Almonds and cashews also support cognitive function with their vitamin E and magnesium content."
    }
  ],
  storage: [
    {
      question: "How should I store dry fruits to keep them fresh?",
      answer: "Store dry fruits in an airtight container in a cool, dry place. For longer shelf life (6+ months), refrigerate them. Avoid exposure to moisture and direct sunlight."
    },
    {
      question: "How long do dry fruits last?",
      answer: "When stored properly, dry fruits last 3-6 months at room temperature and up to 1 year when refrigerated. Always check for freshness before consumption."
    },
    {
      question: "Can I freeze dry fruits?",
      answer: "Yes, you can freeze dry fruits for extended shelf life (up to 2 years). Store in airtight containers or freezer bags to prevent freezer burn."
    }
  ],
  delivery: [
    {
      question: "How long does delivery take?",
      answer: "We deliver within 3-5 business days across India. Same-day delivery is available in Hyderabad for orders placed before 12 PM."
    },
    {
      question: "Do you deliver to rural areas?",
      answer: "Yes, we deliver to both urban and rural areas across India through our reliable courier partners."
    },
    {
      question: "What is your return and refund policy?",
      answer: "We offer 7-day return and refund for any quality issues. If you're not satisfied with the product, contact us within 7 days of delivery for a full refund."
    },
    {
      question: "How is the packaging done?",
      answer: "All dry fruits are packed in food-grade, airtight packaging to maintain freshness. We use vacuum sealing for delicate products and ensure safe transit."
    }
  ]
};

// Schema.org FAQ for structured data
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    ...Object.values(faqData).flat().map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  ]
};
