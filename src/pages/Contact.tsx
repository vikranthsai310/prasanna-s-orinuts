
import { useState } from 'react';
import { Mail, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create mailto link as fallback
      const subject = encodeURIComponent(`Contact Form: Message from ${formData.name}`);
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      );
      const mailtoLink = `mailto:prasannasorinuts@gmail.com?subject=${subject}&body=${body}`;
      
      // Open default email client
      window.location.href = mailtoLink;
      
      toast({
        title: "Opening email client",
        description: "Your default email application will open with the message pre-filled."
      });
      
      // Clear form after a delay
      setTimeout(() => {
        setFormData({ name: '', email: '', message: '' });
      }, 1000);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open email client. Please email us directly at prasannasorinuts@gmail.com",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <SEO
        title="Contact Us - Prasanna's Orinuts"
        description="Get in touch with Prasanna's Orinuts for premium quality dry fruits. Phone: +91 6301308477 | Email: prasannasorinuts@gmail.com"
        canonicalUrl="https://prasannasorinuts.com/contact"
      />
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Have questions about our products or need assistance? We're here to help!
          </p>
        </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="card-premium">
          <h2 className="font-semibold text-xl mb-6">Send us a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="Your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="your.email@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                className="input-field w-full resize-none"
                placeholder="How can we help you?"
                required
              />
            </div>
            
            <Button type="submit" className="w-full btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Opening...' : 'Send Message'}
            </Button>
          </form>
        </div>
        
        {/* Contact Information */}
        <div className="space-y-6">
          <div className="card-premium">
            <h2 className="font-semibold text-xl mb-6">Get in Touch</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-secondary" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">+91 6301308477</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-secondary" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">prasannasorinuts@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        
          <div className="card-premium">
            <h3 className="font-semibold text-lg mb-4">Quick Contact</h3>
            
            <div className="space-y-3">
              <Button 
                className="w-full justify-start bg-green-500 hover:bg-green-600 text-white"
                onClick={() => window.open('https://wa.me/916301308477', '_blank')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat on WhatsApp
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = 'tel:+916301308477'}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Contact;
