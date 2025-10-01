
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, Settings, Package, Shield, BarChart3 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SearchBar from '@/components/SearchBar';
import { toast } from '@/hooks/use-toast';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "default"
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/Logo.png" 
              alt="Prasanna's Orinuts Logo" 
              className="h-10 sm:h-12 lg:h-14 w-auto"
            />
            <span className="font-cormorant text-lg sm:text-xl lg:text-2xl font-bold text-amber-900 hidden xs:block sm:block tracking-wider drop-shadow-sm">
              Prasanna's Orinuts
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground hover:text-secondary transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Desktop Search - beside cart */}
            <div className="hidden md:flex">
              <SearchBar isExpandable={true} />
            </div>

            {/* Mobile Search */}
            <div className="md:hidden">
              <SearchBar isMobile={true} />
            </div>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        {user.isAdmin && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile & Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  
                  {/* Admin Section - Only show for admin users */}
                  {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                        Admin Panel
                      </DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/orders')}>
                        <Package className="mr-2 h-4 w-4" />
                        <span>Manage Orders</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/products')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Manage Products</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Manage Users</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAuthClick}
                className="hidden sm:flex"
              >
                <User className="h-5 w-5" />
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-foreground hover:text-secondary transition-colors font-medium px-2 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <>
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-foreground hover:text-secondary transition-colors font-medium px-2 py-1 text-left flex items-center"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Profile & Settings
                  </button>
                  <button
                    onClick={() => {
                      navigate('/orders');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-foreground hover:text-secondary transition-colors font-medium px-2 py-1 text-left flex items-center"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </button>
                  
                  {/* Admin Section for Mobile - Only show for admin users */}
                  {user.isAdmin && (
                    <>
                      <hr className="border-border" />
                      <div className="px-2 py-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          Admin Panel
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          navigate('/admin/dashboard');
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-foreground hover:text-secondary transition-colors font-medium px-2 py-1 text-left flex items-center"
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          navigate('/admin/orders');
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-foreground hover:text-secondary transition-colors font-medium px-2 py-1 text-left flex items-center"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Manage Orders
                      </button>
                      <button
                        onClick={() => {
                          navigate('/admin/products');
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-foreground hover:text-secondary transition-colors font-medium px-2 py-1 text-left flex items-center"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Manage Products
                      </button>
                      <button
                        onClick={() => {
                          navigate('/admin/users');
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-foreground hover:text-secondary transition-colors font-medium px-2 py-1 text-left flex items-center"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Manage Users
                      </button>
                    </>
                  )}
                  
                  <hr className="border-border" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-red-600 hover:text-red-700 transition-colors font-medium px-2 py-1 text-left flex items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    handleAuthClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-foreground hover:text-secondary transition-colors font-medium px-2 py-1 text-left"
                >
                  {user ? 'Profile' : 'Login'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
