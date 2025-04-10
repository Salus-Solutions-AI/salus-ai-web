import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronRight, LogOut, UserCircle, FileText, BarChart3, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;
  
  const isHomePage = location.pathname === '/';

  const getNavLinks = () => {
    if (isHomePage && !user) {
      return [
        { name: 'Home', path: '#', onClick: () => scrollToSection('top') },
        { name: 'Features', path: '#features', onClick: () => scrollToSection('features') },
        { name: 'FAQ', path: '#faq', onClick: () => scrollToSection('faq') },
        { name: 'Contact Us', path: '#contact-us', onClick: () => scrollToSection('contact-us') },
      ];
    } else {
      return [
        { name: 'Home', path: '/' },
        { name: 'Summary', path: '/summary', icon: <BarChart3 className="h-4 w-4 mr-1" /> },
        { name: 'Incidents', path: '/incidents' },
        { name: 'Clery Logs', path: '/logs' },
        { name: 'Categories', path: '/categories' },
      ];
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const scrollToSection = (sectionId: string) => {
    let targetElement;
    
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    targetElement = document.getElementById(sectionId);
    
    if (targetElement) {
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 50;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 px-4 sm:px-6 lg:px-8",
        isScrolled 
          ? "py-2 bg-white/80 backdrop-blur-sm shadow-sm" 
          : "py-4 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img 
            src="/logo.png" 
            alt="Salus Solutions"
            className="h-16 w-auto mr-auto" 
          />
          <span className="hidden md:block text-2xl font-bold ml-2">
            Salus Solutions
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map(link => (
            link.onClick ? (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  link.onClick();
                }}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium btn-transition flex items-center",
                  "text-foreground/80 hover:text-primary hover:bg-primary/5"
                )}
              >
                {link.icon && link.icon}
                {link.name}
              </a>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium btn-transition flex items-center",
                  isActive(link.path)
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/80 hover:text-primary hover:bg-primary/5"
                )}
              >
                {link.icon && link.icon}
                {link.name}
              </Link>
            )
          ))}
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="ml-4 flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  <span className="max-w-[100px] truncate">
                    {profile?.full_name || user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/account')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              size="sm" 
              className="ml-4 animate-appear"
              onClick={() => location.pathname !== '/login' && window.location.assign('/login')}
            >
              <span>Sign In</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div className="md:hidden animate-slide-in">
          <div className="px-2 pt-2 pb-3 space-y-1 mt-2 bg-white rounded-lg shadow-elevated">
            {navLinks.map(link => (
              link.onClick ? (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    link.onClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium flex items-center",
                    "text-foreground/70 hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {link.icon && link.icon}
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium flex items-center",
                    isActive(link.path)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {link.icon && link.icon}
                  {link.name}
                </Link>
              )
            ))}
            {user ? (
              <>
                <Link
                  to="/account"
                  className="block px-3 py-2 rounded-md text-base font-medium flex items-center"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive" 
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <div className="pt-2 pb-1">
                <Button 
                  className="w-full"
                  onClick={() => location.pathname !== '/login' && window.location.assign('/login')}
                >
                  <span>Sign In</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
