import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_MEMBER_MEMBERS } from "./member-numbers";

type Member = { number: string; name: string };
type Customer = { name: string; phone: string; address: string; city: string; pincode: string };

// LocalStorage keys used by membership and customer flows.
// - MEMBER_SESSION_KEY: currently logged-in member.
// - MEMBER_LIST_KEY: admin-managed allowed member numbers.
// - CUSTOMER_SESSION_KEY: currently logged-in customer.
// - CUSTOMER_LIST_KEY: registered customer list.
const MEMBER_SESSION_KEY = "gc_member_session";
const MEMBER_LIST_KEY = "gc_members";
const CUSTOMER_SESSION_KEY = "gc_customer_session";
const CUSTOMER_LIST_KEY = "gc_customers";

type MemberContextType = {
  member: Member | null;
  members: Member[];
  isMember: boolean;
  loginMember: (number: string) => boolean;
  addMember: (number: string, name: string) => boolean;
  logoutMember: () => void;
  memberName: string;
  customer: Customer | null;
  registerCustomer: (customer: Customer) => boolean;
  loginCustomer: (phone: string) => boolean;
  logoutCustomer: () => void;
  customerList: Customer[];
};

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerList, setCustomerList] = useState<Customer[]>([]);

  useEffect(() => {
    const savedMemberSession = localStorage.getItem(MEMBER_SESSION_KEY);
    const savedMembers = localStorage.getItem(MEMBER_LIST_KEY);
    const savedCustomerSession = localStorage.getItem(CUSTOMER_SESSION_KEY);
    const savedCustomers = localStorage.getItem(CUSTOMER_LIST_KEY);

    if (savedMembers) {
      try {
        const parsed = JSON.parse(savedMembers) as Member[];
        setMembers(parsed);
      } catch {
        setMembers(DEFAULT_MEMBER_MEMBERS);
      }
    } else {
      setMembers(DEFAULT_MEMBER_MEMBERS);
    }

    if (savedMemberSession) {
      try {
        const parsed = JSON.parse(savedMemberSession) as Member;
        setMember(parsed);
      } catch {
        setMember(null);
      }
    }

    if (savedCustomers) {
      try {
        const parsed = JSON.parse(savedCustomers) as Customer[];
        setCustomerList(parsed);
      } catch {
        setCustomerList([]);
      }
    }

    if (savedCustomerSession) {
      try {
        const parsed = JSON.parse(savedCustomerSession) as Customer;
        setCustomer(parsed);
      } catch {
        setCustomer(null);
      }
    }
  }, []);

  const persistMembers = (next: Member[]) => {
    setMembers(next);
    localStorage.setItem(MEMBER_LIST_KEY, JSON.stringify(next));
  };

  const persistMemberSession = (next: Member | null) => {
    setMember(next);
    if (next) localStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(next));
    else localStorage.removeItem(MEMBER_SESSION_KEY);
  };

  const persistCustomers = (next: Customer[]) => {
    setCustomerList(next);
    localStorage.setItem(CUSTOMER_LIST_KEY, JSON.stringify(next));
  };

  const persistCustomerSession = (next: Customer | null) => {
    setCustomer(next);
    if (next) localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(next));
    else localStorage.removeItem(CUSTOMER_SESSION_KEY);
  };

  const loginMember = (number: string) => {
    const cleaned = number.trim();
    if (!cleaned) return false;
    const found = members.find((m) => m.number === cleaned);
    if (!found) return false;
    persistMemberSession(found);
    return true;
  };

  const addMember = (number: string, name: string) => {
    const cleanedNumber = number.trim();
    const cleanedName = name.trim();
    if (!cleanedNumber || !cleanedName) return false;
    if (members.some((m) => m.number === cleanedNumber)) return false;
    const next = [...members, { number: cleanedNumber, name: cleanedName }];
    persistMembers(next);
    return true;
  };

  const logoutMember = () => {
    persistMemberSession(null);
  };

  const registerCustomer = (data: Customer) => {
    if (!data.name.trim() || !data.phone.trim()) return false;
    const next = [...customerList.filter((c) => c.phone !== data.phone), data];
    persistCustomers(next);
    persistCustomerSession(data);
    return true;
  };

  const loginCustomer = (phone: string) => {
    const cleaned = phone.trim();
    if (!cleaned) return false;
    const found = customerList.find((c) => c.phone === cleaned);
    if (!found) return false;
    persistCustomerSession(found);
    return true;
  };

  const logoutCustomer = () => {
    persistCustomerSession(null);
  };

  const value = useMemo(() => ({
    member,
    members,
    isMember: member !== null,
    loginMember,
    addMember,
    logoutMember,
    memberName: member?.name ?? "",
    customer,
    registerCustomer,
    loginCustomer,
    logoutCustomer,
    customerList,
  }), [member, members, customer, customerList]);

  return <MemberContext.Provider value={value}>{children}</MemberContext.Provider>;
}

export function useMember() {
  const context = useContext(MemberContext);
  if (!context) throw new Error("useMember must be used within MemberProvider");
  return context;
}
