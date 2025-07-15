import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Sample blog posts about dry fruits
const blogPosts = [
  {
    id: 'benefits-of-almonds',
    title: 'Top 10 Health Benefits of Almonds You Need to Know',
    description: 'Discover why almonds are considered a superfood and how they can improve your health.',
    image: '/public/almond.png',
    date: 'June 15, 2023',
    readTime: '5 min read',
    tags: ['almonds', 'health benefits', 'nutrition', 'dry fruits'],
    excerpt: 'Almonds are packed with nutrients and offer numerous health benefits including heart health, weight management, and more.'
  },
  {
    id: 'cashews-nutrition',
    title: 'Cashew Nutrition: Why These Kidney-Shaped Nuts Are Good For You',
    description: 'Learn about the nutritional profile of cashews and their impact on your health.',
    image: '/public/cashew.png',
    date: 'July 22, 2023',
    readTime: '4 min read',
    tags: ['cashews', 'nutrition', 'healthy fats', 'dry fruits'],
    excerpt: 'Cashews are rich in heart-healthy fats, protein, and essential minerals that support overall wellbeing.'
  },
  {
    id: 'walnuts-brain-health',
    title: 'Walnuts and Brain Health: The Science-Backed Connection',
    description: 'Explore the research behind walnuts and their positive effects on cognitive function.',
    image: '/public/walnut.png',
    date: 'August 5, 2023',
    readTime: '6 min read',
    tags: ['walnuts', 'brain health', 'omega-3', 'dry fruits'],
    excerpt: 'Walnuts contain omega-3 fatty acids and antioxidants that may help improve brain function and prevent cognitive decline.'
  },
  {
    id: 'dry-fruits-weight-loss',
    title: 'Can Dry Fruits Help You Lose Weight? The Truth Revealed',
    description: 'Debunking myths and revealing facts about dry fruits in weight management.',
    image: '/public/placeholder.svg',
    date: 'September 12, 2023',
    readTime: '7 min read',
    tags: ['weight loss', 'dry fruits', 'healthy snacking', 'nutrition'],
    excerpt: 'Contrary to popular belief, incorporating dry fruits in your diet can actually support weight loss goals when consumed properly.'
  }
];

const Blog = () => {
  // Update page title and meta for SEO
  useEffect(() => {
    document.title = "Dry Fruits Blog - Health Benefits, Nutrition & Recipes | Premium Orchard";
    
    // Find and update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Explore our collection of articles about dry fruits including health benefits, nutritional information, recipes, and storage tips. Learn why premium dry fruits are essential for a healthy lifestyle.');
    }
    
    return () => {
      document.title = "Premium Dry Fruits & Nuts | Prasanna's Orinut | High-Quality Almonds, Cashews & Walnuts";
      if (metaDescription) {
        metaDescription.setAttribute('content', "Buy premium quality dry fruits and nuts online. Fresh, nutritious and carefully selected almonds, cashews, walnuts and more. 100% natural with no additives.");
      }
    };
  }, []);

  // Add blog structured data
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'blog-jsonld';

    const blogStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      'headline': 'Premium Orchard Dry Fruits Blog',
      'description': 'Articles about dry fruits, their health benefits, and usage tips',
      'author': {
        '@type': 'Organization',
        'name': "Prasanna's Orinut - Premium Orchard"
      },
      'publisher': {
        '@type': 'Organization',
        'name': "Prasanna's Orinut",
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://premiumorchard.com/favicon.ico'
        }
      },
      'blogPost': blogPosts.map(post => ({
        '@type': 'BlogPosting',
        'headline': post.title,
        'description': post.description,
        'image': `https://premiumorchard.com${post.image}`,
        'datePublished': post.date,
        'author': {
          '@type': 'Organization',
          'name': "Prasanna's Orinut"
        },
        'keywords': post.tags.join(', ')
      }))
    };

    script.innerHTML = JSON.stringify(blogStructuredData);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('blog-jsonld');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="font-playfair text-4xl font-bold mb-4">Dry Fruits Blog</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our collection of articles about the health benefits, nutritional information, 
          and creative ways to incorporate premium dry fruits into your daily diet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden flex flex-col h-full">
            <div className="aspect-video overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardHeader>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <span>{post.date}</span>
                <span className="mx-2">•</span>
                <span>{post.readTime}</span>
              </div>
              <CardTitle className="font-playfair">{post.title}</CardTitle>
              <CardDescription>{post.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">{post.excerpt}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <Link to={`/blog/${post.id}`}>
                <Button variant="outline">Read More</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 bg-accent/10 p-8 rounded-lg">
        <div className="text-center mb-6">
          <h2 className="font-playfair text-3xl font-bold">Subscribe to Our Newsletter</h2>
          <p className="text-muted-foreground mt-2">Get the latest articles, recipes and exclusive offers directly to your inbox.</p>
        </div>
        <form className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
          <input 
            type="email" 
            placeholder="Your email address" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            required
          />
          <Button type="submit">Subscribe</Button>
        </form>
      </div>
    </div>
  );
};

export default Blog; 