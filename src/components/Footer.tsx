
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/Logo.png" 
                alt="Prasanna's Orinuts Logo" 
                className="h-8 w-auto"
              />
              <span className="font-playfair text-xl font-semibold">
                Prasanna's Orinuts
              </span>
            </div>
            <p className="text-primary-foreground/80 mb-4 max-w-md">
              Premium quality dry fruits, carefully selected and delivered fresh to your doorstep. 
              Experience the finest nuts and dried fruits from around the world.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center hover:bg-secondary/30 transition-colors">
                <Facebook size={16} className="text-primary-foreground" />
              </a>
              <a href="#" className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center hover:bg-secondary/30 transition-colors">
                <Instagram size={16} className="text-primary-foreground" />
              </a>
              <a href="#" className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center hover:bg-secondary/30 transition-colors">
                <Youtube size={16} className="text-primary-foreground" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/60">
            © 2024 Prasanna's Orinuts. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
