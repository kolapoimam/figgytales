import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginButton from './LoginButton';
import ThemeToggle from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sparkles, LogOut, User, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-white/80 dark:bg-transparent backdrop-blur-lg">
      {/* Constrain the max width and center the content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-orange-500" />
            <span className="font-bold text-xl bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text">
              FiggyTales
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-sm font-medium transition-colors text-gray-700 dark:text-white hover:text-orange-500 dark:hover:text-orange-500"
            >
              Home
            </Link>
            <a
              href="#"
              className="text-sm font-medium transition-colors text-gray-700 dark:text-white hover:text-orange-500 dark:hover:text-orange-500"
            >
              Features
            </a>
            <a
              href="#"
              className="text-sm font-medium transition-colors text-gray-700 dark:text-white hover:text-orange-500 dark:hover:text-orange-500"
            >
              Pricing
            </a>
            <a
              href="#"
              className="text-sm font-medium transition-colors text-gray-700 dark:text-white hover:text-orange-500 dark:hover:text-orange-500"
            >
              About
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Right Side (Theme Toggle and User Actions) */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.user_metadata?.name || user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex cursor-pointer items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="flex cursor-pointer items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden flex flex-col space-y-2 pb-4 px-4">
            <Link
              to="/"
              className="text-sm font-medium transition-colors text-gray-700 dark:text-white hover:text-orange-500 dark:hover:text-orange-500"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <a
              href="#"
              className="text-sm font-medium transition-colors text-gray-700 dark:text-white hover:text-orange-500 dark:hover:text-orange-500"
              onClick={toggleMenu}
            >
              Features
            </a>
            <a
              href="#"
              className="text-sm font-medium transition-colors text-gray-700 dark:text-white hover:text-orange-500 dark:hover:text-orange-500"
              onClick={toggleMenu}
            >
              Pricing
            </a>
            <a
              href="#"
              className="text-sm font-medium transition-colors text-gray-700 dark:text-white hover:text-orange-500 dark:hover:text-orange-500"
              onClick={toggleMenu}
            >
              About
            </a>
            <div className="flex items-center space-x-3 pt-2">
              <ThemeToggle />
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
                        <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.email}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.user_metadata?.name || user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex cursor-pointer items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="flex cursor-pointer items-center"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <LoginButton />
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
