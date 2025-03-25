
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className={cn(
      "w-full max-w-5xl mx-auto py-8 px-4 md:px-6 animate-fade-in", 
      className
    )}>
      <div className="flex flex-col items-center text-center">
        <Link 
          to="/"
          className="relative group"
        >
          <h1 className="text-4xl md:text-5xl font-semibold bg-clip-text bg-gradient-to-r from-primary to-accent text-transparent transition-all duration-300">
            FiggyTales
          </h1>
          <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
        </Link>
        <p className="mt-2 text-muted-foreground text-lg max-w-md animate-fade-in">
          {isHome 
            ? "Transform design screens into meaningful user stories" 
            : "Your generated user stories and acceptance criteria"}
        </p>
      </div>
    </header>
  );
};

export default Header;
