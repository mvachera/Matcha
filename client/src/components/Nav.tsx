import React, { useState, useEffect } from "react";
import { Menu, Globe, Home, User, LogOut, Heart } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";


const Navbar = ({ isGlobePage=false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const NavLinks = ({ isMobile = false }) => (
    <>
      <Button
        variant="ghost"
        className={`${isMobile ? "justify-start w-full py-6" : "h-12"} rounded-lg transition-colors ${!isMobile && isGlobePage ? "text-white hover:bg-white/10" : ""}`}
        onClick={() => handleNavigate("/")}>
        <Home className={`${isMobile ? "mr-3" : "mr-2"} h-5 w-5`} />
        <span className={isMobile ? "text-base" : ""}>Home</span>
      </Button>
      <Button
        variant="ghost"
        className={`${isMobile ? "justify-start w-full py-6" : "h-12"} rounded-lg transition-colors ${!isMobile && isGlobePage ? "text-white hover:bg-white/10" : ""}`}
        onClick={() => handleNavigate("/globe")}>
        <Globe className={`${isMobile ? "mr-3" : "mr-2"} h-5 w-5`} />
        <span className={isMobile ? "text-base" : ""}>Globe</span>
      </Button>
    </>
  );

  const UserMenu = ({ isMobile = false }) => {
    const content = isMobile ? (
      <div className="space-y-3 pt-3">
        <div className="flex items-center p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors" onClick={() => handleNavigate("/profile")}>
          <User className="mr-3 h-5 w-5 text-indigo-500" />
          <span className="text-base">Edit Profile</span>
        </div>
        <div className="flex items-center p-2 rounded-lg hover:bg-red-50 cursor-pointer transition-colors text-red-600" onClick={handleLogout}>
          <LogOut className="mr-3 h-5 w-5" />
          <span className="text-base">Logout</span>
        </div>
      </div>
    ) : (
      <>
        <DropdownMenuItem className="flex items-center cursor-pointer p-3" onClick={() => handleNavigate("/profile")}>
          <User className="mr-2 h-4 w-4 text-indigo-500" />
          <span>Edit Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center cursor-pointer p-3 text-red-600" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </>
    );

    if (isMobile) {
      return (
        <div className="border-t border-slate-200 mt-4 pt-4">
          <div className="flex items-center p-2 mb-3">
            <Avatar className="h-10 w-10 mr-3 border-2 border-indigo-100">
              <AvatarImage src={user.profile_picture} alt={user.firstname} />
              <AvatarFallback>{user.firstname?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-slate-800">{user.firstname}</p>
              <p className="text-xs text-slate-500">Your Profile</p>
            </div>
          </div>
          {content}
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={`rounded-full h-10 w-10 p-0 ml-2 ${isGlobePage ? "hover:bg-white/10" : ""}`}>
            <Avatar className={`h-9 w-9 ${isGlobePage ? "border-2 border-white/30" : "border-2 border-indigo-100"}`}>
              <AvatarImage src={user.profile_picture} alt={user.firstname} />
              <AvatarFallback>{user.firstname?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-2">
          <div className="flex items-center p-2 mb-1">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={user.profile_picture} alt={user.firstname} />
              <AvatarFallback>{user.firstname?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-slate-800">{user.firstname}</p>
              <p className="font-s text-slate-800">{user.username}</p>
              <p className="text-xs text-slate-500">Your Profile</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          {content}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Mobile menu using Sheet from shadcn/ui
  const MobileMenu = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={`md:hidden h-10 w-10 ${isGlobePage ? "text-white hover:bg-white/10" : ""}`}>
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center">
            <Heart className="h-6 w-6 text-pink-500 mr-2" />
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">Matchy-matchy</span>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col p-6">
          <div className="space-y-1">
            <NavLinks isMobile={true} />
          </div>
          <UserMenu isMobile={true} />
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      {/* Hover trigger area that spans the top of the screen */}
      <div 
        className="fixed top-0 left-0 right-0 h-4 z-50 cursor-pointer"
        onMouseEnter={() => setShowNavbar(true)}
      />
      
      <nav 
        className={`transition-transform duration-300 transform ${showNavbar ? 'translate-y-0' : '-translate-y-full'} ${isGlobePage ? "absolute top-0 left-0 right-0 z-40 bg-transparent" : "fixed top-0 left-0 right-0 z-40 bg-white shadow-sm border-b"}`}
        onMouseLeave={() => setShowNavbar(false)}
        onMouseEnter={() => setShowNavbar(true)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <MobileMenu />
              <div className="flex-shrink-0 flex items-center">
                <Heart className="h-6 w-6 text-pink-500 mr-2 hidden md:block" />
                <span className={`text-xl font-bold ${isGlobePage ? "text-white drop-shadow-md" : "bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent"}`}>
                  Matchy-matchy
                </span>
              </div>
              <div className="hidden md:ml-10 md:flex md:space-x-4">
                <NavLinks />
              </div>
            </div>
            <div className="flex items-center">
              <div className="block">
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Indicator that shows when navbar is hidden */}
      <div 
        className={`fixed top-0 left-1/2 transform -translate-x-1/2 bg-white/90 rounded-b-lg shadow-md px-4 py-1 z-30 transition-opacity duration-300 ${showNavbar ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onMouseEnter={() => setShowNavbar(true)}
      >
        <div className="flex items-center">
          <Heart className="h-4 w-4 text-pink-500 mr-2" />
          <span className="text-sm font-medium">Menu</span>
        </div>
      </div>
    </>
  );
};

export default Navbar;