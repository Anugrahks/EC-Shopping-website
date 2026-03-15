import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-context";
import { useMember } from "@/lib/member-context";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [numberInput, setNumberInput] = useState("");
  const [userPhoneInput, setUserPhoneInput] = useState("");
  const [userNameInput, setUserNameInput] = useState("");
  const [userAddressInput, setUserAddressInput] = useState("");
  const [userCityInput, setUserCityInput] = useState("");
  const [userPincodeInput, setUserPincodeInput] = useState("");
  const { totalItems } = useCart();
  const {
    member,
    isMember,
    memberName,
    loginMember,
    logoutMember,
    customer,
    registerCustomer,
    loginCustomer,
    logoutCustomer,
  } = useMember();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card shadow-sm">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🥬</span>
          <span className="text-xl font-bold text-primary">EC Shopping</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 pr-20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7">
              Search
            </Button>
          </div>
        </form>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/products" className="hover:text-primary transition-colors">Shop</Link>
          <Link to="/about" className="hover:text-primary transition-colors">About</Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-full border border-muted/40 bg-muted/10 px-3 py-1 text-xs text-muted-foreground">
            {isMember ? `EC Shopping Card • ${memberName}` : customer ? `Welcome ${customer.name}` : "Not signed in"}
            {isMember && <button onClick={logoutMember} className="underline text-xs ml-2">Logout</button>}
            {!isMember && customer && <button onClick={logoutCustomer} className="underline text-xs ml-2">Logout</button>}
          </div>
          <Link to="/cart" className="relative">
            <ShoppingCart className="h-6 w-6 text-foreground hover:text-primary transition-colors" />
            {totalItems > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-secondary text-secondary-foreground">
                {totalItems}
              </Badge>
            )}
          </Link>
          <Link to="/admin">
            <User className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="hidden md:flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Member number"
                className="w-28"
                value={numberInput}
                onChange={(e) => setNumberInput(e.target.value)}
              />
              <Button size="sm" onClick={() => {
                const ok = loginMember(numberInput);
                setMessage(ok ? "Member login successful" : "Member not found");
              }}>
                Member Login
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Customer phone"
                className="w-28"
                value={userPhoneInput}
                onChange={(e) => setUserPhoneInput(e.target.value)}
              />
              <Button size="sm" onClick={() => {
                const ok = loginCustomer(userPhoneInput);
                setMessage(ok ? "Customer logged in" : "Customer not registered");
              }}>
                Customer Login
              </Button>
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Name"
                className="w-24"
                value={userNameInput}
                onChange={(e) => setUserNameInput(e.target.value)}
              />
              <Input
                placeholder="Address"
                className="w-24"
                value={userAddressInput}
                onChange={(e) => setUserAddressInput(e.target.value)}
              />
              <Input
                placeholder="City"
                className="w-20"
                value={userCityInput}
                onChange={(e) => setUserCityInput(e.target.value)}
              />
              <Input
                placeholder="Pincode"
                className="w-20"
                value={userPincodeInput}
                onChange={(e) => setUserPincodeInput(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={() => {
              const data = {
                name: userNameInput,
                phone: userPhoneInput,
                address: userAddressInput,
                city: userCityInput,
                pincode: userPincodeInput,
              };
              const ok = registerCustomer(data);
              setMessage(ok ? "Customer registered" : "Fill name and phone");
            }}>
              Register Customer
            </Button>
            <div>{message}</div>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-card px-4 py-3 space-y-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </form>
          <div className="flex flex-col gap-2 text-sm font-medium">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary">Home</Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary">Shop</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-primary">About</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
