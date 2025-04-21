import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-secondary/50 py-6 md:py-8 mt-auto border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">FiggyTales</h3>
            <p className="text-sm text-muted-foreground">
              Transform your design mockups into comprehensive user stories with our AI-powered tool.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link to="/documentation" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-6 md:my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-center space-y-2 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FiggyTales. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with ❤️ for Product Teams
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
