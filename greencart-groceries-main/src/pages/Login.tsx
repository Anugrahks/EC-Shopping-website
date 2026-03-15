import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useMember } from "@/lib/member-context";
import { toast } from "sonner";

const Login = () => {
  const { loginMember, registerCustomer, loginCustomer, isMember, memberName, customer } = useMember();
  const navigate = useNavigate();
  const [memberNumber, setMemberNumber] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerPincode, setCustomerPincode] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-2xl">💳</span>
              <div>
                <h1 className="text-xl font-bold">EC Member Login</h1>
                <p className="text-sm text-muted-foreground">Only admin-approved member numbers can login.</p>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Member Number</Label>
              <Input
                placeholder="Enter member number"
                value={memberNumber}
                onChange={(e) => setMemberNumber(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={() => {
                  const ok = loginMember(memberNumber);
                  if (ok) {
                    toast.success(`Welcome ${memberName || "Member"}!`);
                    navigate("/");
                  } else {
                    toast.error("Member not recognized. Ask admin to add your number.");
                  }
                }}
              >
                Member Login
              </Button>
            </div>
          </Card>
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-2xl">👤</span>
              <div>
                <h1 className="text-xl font-bold">Customer Login / Register</h1>
                <p className="text-sm text-muted-foreground">Register once, then login with phone.</p>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Login</Label>
              <Input
                placeholder="Phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={() => {
                  const ok = loginCustomer(customerPhone);
                  if (ok) {
                    toast.success("Customer logged in");
                    navigate("/");
                  } else {
                    toast.error("Customer not found, please register");
                  }
                }}
              >
                Customer Login
              </Button>
              <div className="border-t pt-3" />
              <Label>Register</Label>
              <Input placeholder="Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              <Input placeholder="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
              <Input placeholder="Address" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
              <Input placeholder="City" value={customerCity} onChange={(e) => setCustomerCity(e.target.value)} />
              <Input placeholder="Pincode" value={customerPincode} onChange={(e) => setCustomerPincode(e.target.value)} />
              <Button
                className="w-full"
                onClick={() => {
                  const ok = registerCustomer({
                    name: customerName,
                    phone: customerPhone,
                    address: customerAddress,
                    city: customerCity,
                    pincode: customerPincode,
                  });
                  if (ok) {
                    toast.success("Customer registered and logged in");
                    navigate("/");
                  } else {
                    toast.error("Name and phone are required");
                  }
                }}
              >
                Register Customer
              </Button>
            </div>
          </Card>
        </div>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Already have a member number? Use member login. For normal shopping, use customer login.
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
