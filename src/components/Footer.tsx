
import { Link } from 'react-router-dom';
import { Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
      <div className="bg-amber-950 text-amber-50 rounded-3xl shadow-2xl">
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
              <span className="font-cormorant text-xl font-bold text-amber-200">
                Prasanna's Orinuts
              </span>
            </div>
            <p className="text-amber-100/80 mb-4 max-w-md">
              Premium quality dry fruits, carefully selected and delivered fresh to your doorstep. 
              Experience the finest nuts and dried fruits from around the world.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-8 h-8 bg-amber-600/30 rounded-full flex items-center justify-center hover:bg-amber-600/50 transition-colors border border-amber-600/40">
                <Instagram size={16} className="text-amber-200" />
              </a>
              <a href="#" className="w-8 h-8 bg-amber-600/30 rounded-full flex items-center justify-center hover:bg-amber-600/50 transition-colors border border-amber-600/40">
                <Youtube size={16} className="text-amber-200" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-amber-300">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-amber-100/80 hover:text-amber-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-amber-100/80 hover:text-amber-400 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-amber-100/80 hover:text-amber-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-amber-300">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-amber-100/80 hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-amber-100/80 hover:text-amber-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="text-amber-100/80 hover:text-amber-400 transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="text-amber-100/80 hover:text-amber-400 transition-colors">
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-amber-600/30 mt-8 pt-8 text-center">
          <p className="text-amber-200/70">
            © 2025 Prasanna's Orinuts. All rights reserved.
          </p>
        </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
