
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Home, Package, LogOut, Settings, BarChart3, Tag, Shield, Truck } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [navigate]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

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

  const mainNavigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'All Products', href: '/products', icon: Package },
    { name: 'My Orders', href: '/orders', icon: Package },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 border-b border-amber-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left - Hamburger Menu */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="group relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-amber-50 transition-all duration-300"
                aria-label="Menu"
              >
                <div className="flex flex-col justify-center items-center w-6 h-6 space-y-1.5">
                  <span 
                    className={`block h-0.5 w-6 bg-amber-900 transition-all duration-300 ease-out ${
                      isMenuOpen ? 'rotate-45 translate-y-2' : ''
                    }`}
                  />
                  <span 
                    className={`block h-0.5 w-6 bg-amber-900 transition-all duration-300 ease-out ${
                      isMenuOpen ? 'opacity-0' : ''
                    }`}
                  />
                  <span 
                    className={`block h-0.5 w-6 bg-amber-900 transition-all duration-300 ease-out ${
                      isMenuOpen ? '-rotate-45 -translate-y-2' : ''
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Center - Logo with Tagline */}
            <Link 
              to="/" 
              className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-3 group"
            >
              <img 
                src="/Logo.png" 
                alt="Prasanna's Orinuts Logo" 
                className="h-10 sm:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
              <div className="hidden sm:flex flex-col items-start">
                <span className="font-cormorant text-lg sm:text-xl lg:text-2xl font-bold text-amber-900 tracking-wide leading-tight">
                  Prasanna's Orinuts
                </span>
                <span className="font-sans text-[10px] sm:text-xs text-amber-700 tracking-wider uppercase font-medium -mt-0.5">
                  Premium Dry Fruits
                </span>
              </div>
            </Link>

            {/* Right side actions */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Desktop Search */}
              <div className="hidden md:flex">
                <SearchBar isExpandable={true} />
              </div>

              {/* Mobile Search */}
              <div className="md:hidden">
                <SearchBar isMobile={true} />
              </div>

              {/* Cart */}
              <Link to="/cart">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative hover:bg-amber-50 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5 text-amber-900" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Auth - Hidden on mobile, visible on desktop */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden md:flex hover:bg-amber-50 transition-colors"
                    >
                      <User className="h-5 w-5 text-amber-900" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border-amber-200">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium leading-none text-amber-900">{user.name}</p>
                          {user.isAdmin && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs leading-none text-amber-700">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-amber-100" />
                    <DropdownMenuItem 
                      onClick={() => navigate('/profile')}
                      className="hover:bg-amber-50 cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4 text-amber-700" />
                      <span>Profile & Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/orders')}
                      className="hover:bg-amber-50 cursor-pointer"
                    >
                      <Package className="mr-2 h-4 w-4 text-amber-700" />
                      <span>My Orders</span>
                    </DropdownMenuItem>
                    
                    {user.isAdmin && (
                      <>
                        <DropdownMenuSeparator className="bg-amber-100" />
                        <DropdownMenuLabel className="text-xs text-amber-700 uppercase tracking-wider font-semibold">
                          Admin Panel
                        </DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => navigate('/admin/dashboard')}
                          className="hover:bg-amber-50 cursor-pointer"
                        >
                          <BarChart3 className="mr-2 h-4 w-4 text-amber-700" />
                          <span>Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => navigate('/admin/orders')}
                          className="hover:bg-amber-50 cursor-pointer"
                        >
                          <Package className="mr-2 h-4 w-4 text-amber-700" />
                          <span>Manage Orders</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => navigate('/admin/delivery')}
                          className="hover:bg-amber-50 cursor-pointer"
                        >
                          <Truck className="mr-2 h-4 w-4 text-amber-700" />
                          <span>Delivery Management</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => navigate('/admin/products')}
                          className="hover:bg-amber-50 cursor-pointer"
                        >
                          <Settings className="mr-2 h-4 w-4 text-amber-700" />
                          <span>Manage Products</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => navigate('/admin/users')}
                          className="hover:bg-amber-50 cursor-pointer"
                        >
                          <User className="mr-2 h-4 w-4 text-amber-700" />
                          <span>Manage Users</span>
                        </DropdownMenuItem>
                        {user.adminRole === 'super-admin' && (
                          <DropdownMenuItem 
                            onClick={() => navigate('/admin/admin-management')}
                            className="hover:bg-amber-50 cursor-pointer"
                          >
                            <Shield className="mr-2 h-4 w-4 text-purple-700" />
                            <span>Admin Management</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => navigate('/admin/coupons')}
                          className="hover:bg-amber-50 cursor-pointer"
                        >
                          <Tag className="mr-2 h-4 w-4 text-amber-700" />
                          <span>Manage Coupons</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => navigate('/admin/discounts')}
                          className="hover:bg-amber-50 cursor-pointer"
                        >
                          <Tag className="mr-2 h-4 w-4 text-amber-700" />
                          <span>Product Discounts</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => navigate('/admin/samples')}
                          className="hover:bg-amber-50 cursor-pointer"
                        >
                          <Package className="mr-2 h-4 w-4 text-amber-700" />
                          <span>Manage Samples</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator className="bg-amber-100" />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-600 hover:bg-red-50 cursor-pointer"
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
                  className="hidden md:flex hover:bg-amber-50 transition-colors"
                >
                  <User className="h-5 w-5 text-amber-900" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Menu */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Navigation Links - Scrollable */}
          <nav className="flex-1 overflow-y-auto pt-20 px-6 pb-8 space-y-2">
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-4 px-4 py-3 rounded-xl text-amber-900 hover:bg-amber-100/80 transition-all duration-200 group font-medium"
                >
                  <Icon className="h-5 w-5 text-amber-700 group-hover:text-amber-900 transition-colors" />
                  <span className="text-base">{item.name}</span>
                </Link>
              );
            })}

            {/* User Section */}
            {user && (
              <>
                <div className="pt-4 mt-4 border-t border-amber-200">
                  <div className="px-4 mb-3">
                    <p className="text-xs uppercase tracking-wider text-amber-700 font-semibold">
                      Account
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-4 px-4 py-3 rounded-xl text-amber-900 hover:bg-amber-100/80 transition-all duration-200 w-full group"
                  >
                    <Settings className="h-5 w-5 text-amber-700 group-hover:text-amber-900" />
                    <span className="text-base">Profile & Settings</span>
                  </button>
                </div>

                {/* Admin Section */}
                {user.isAdmin && (
                  <div className="pt-4 mt-4 border-t border-amber-200">
                    <div className="px-4 mb-3">
                      <p className="text-xs uppercase tracking-wider text-amber-700 font-semibold">
                        Admin Panel
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        navigate('/admin/dashboard');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-4 px-4 py-3 rounded-xl text-amber-900 hover:bg-amber-100/80 transition-all duration-200 w-full group"
                    >
                      <BarChart3 className="h-5 w-5 text-amber-700 group-hover:text-amber-900" />
                      <span className="text-base">Dashboard</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/admin/orders');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-4 px-4 py-3 rounded-xl text-amber-900 hover:bg-amber-100/80 transition-all duration-200 w-full group"
                    >
                      <Package className="h-5 w-5 text-amber-700 group-hover:text-amber-900" />
                      <span className="text-base">Manage Orders</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/admin/delivery');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-4 px-4 py-3 rounded-xl text-amber-900 hover:bg-amber-100/80 transition-all duration-200 w-full group"
                    >
                      <Truck className="h-5 w-5 text-amber-700 group-hover:text-amber-900" />
                      <span className="text-base">Delivery Management</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/admin/products');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-4 px-4 py-3 rounded-xl text-amber-900 hover:bg-amber-100/80 transition-all duration-200 w-full group"
                    >
                      <Settings className="h-5 w-5 text-amber-700 group-hover:text-amber-900" />
                      <span className="text-base">Manage Products</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/admin/users');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-4 px-4 py-3 rounded-xl text-amber-900 hover:bg-amber-100/80 transition-all duration-200 w-full group"
                    >
                      <User className="h-5 w-5 text-amber-700 group-hover:text-amber-900" />
                      <span className="text-base">Manage Users</span>
                    </button>
                    
                    {user.adminRole === 'super-admin' && (
                      <button
                        onClick={() => {
                          navigate('/admin/admin-management');
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-4 px-4 py-3 rounded-xl text-purple-900 hover:bg-purple-100/80 transition-all duration-200 w-full group"
                      >
                        <Shield className="h-5 w-5 text-purple-700 group-hover:text-purple-900" />
                        <span className="text-base">Admin Management</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        navigate('/admin/coupons');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-4 px-4 py-3 rounded-xl text-amber-900 hover:bg-amber-100/80 transition-all duration-200 w-full group"
                    >
                      <Tag className="h-5 w-5 text-amber-700 group-hover:text-amber-900" />
                      <span className="text-base">Manage Coupons</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/admin/discounts');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-4 px-4 py-3 rounded-xl text-amber-900 hover:bg-amber-100/80 transition-all duration-200 w-full group"
                    >
                      <Tag className="h-5 w-5 text-amber-700 group-hover:text-amber-900" />
                      <span className="text-base">Product Discounts</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/admin/samples');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-4 px-4 py-3 rounded-xl text-amber-900 hover:bg-amber-100/80 transition-all duration-200 w-full group"
                    >
                      <Package className="h-5 w-5 text-amber-700 group-hover:text-amber-900" />
                      <span className="text-base">Manage Samples</span>
                    </button>
                  </div>
                )}

                {/* Logout */}
                <div className="pt-4 mt-4 border-t border-amber-200">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-4 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 w-full group font-medium"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-base">Logout</span>
                  </button>
                </div>
              </>
            )}

            {/* Login for non-logged in users */}
            {!user && (
              <div className="pt-4 mt-4 border-t border-amber-200">
                <button
                  onClick={() => {
                    handleAuthClick();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-all duration-200 w-full font-medium shadow-lg"
                >
                  <User className="h-5 w-5" />
                  <span className="text-base">Login / Sign Up</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;
