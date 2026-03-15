import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_MEMBER_NUMBERS } from "./member-numbers";

const MEMBER_NUMBER_KEY = "gc_member_number";
const REGISTERED_NUMBERS_KEY = "gc_registered_numbers";

type MemberContextType = {
  memberNumber: string;
  isMember: boolean;
  registeredNumbers: string[];
  loginNumber: (number: string) => boolean;
  addMemberNumber: (number: string) => boolean;
  logoutMember: () => void;
  isNumberRegistered: (number: string) => boolean;
  description: string;
};

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [memberNumber, setMemberNumberState] = useState<string>("");
  const [registeredNumbers, setRegisteredNumbers] = useState<string[]>([]);

  useEffect(() => {
    const savedMember = localStorage.getItem(MEMBER_NUMBER_KEY);
    const savedRegistered = localStorage.getItem(REGISTERED_NUMBERS_KEY);
    if (savedMember) setMemberNumberState(savedMember);
    if (savedRegistered) {
      try {
        const parsed = JSON.parse(savedRegistered) as string[];
        setRegisteredNumbers(parsed);
      } catch {
        setRegisteredNumbers(DEFAULT_MEMBER_NUMBERS);
      }
    } else {
      setRegisteredNumbers(DEFAULT_MEMBER_NUMBERS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(MEMBER_NUMBER_KEY, memberNumber);
  }, [memberNumber]);

  useEffect(() => {
    localStorage.setItem(REGISTERED_NUMBERS_KEY, JSON.stringify(registeredNumbers));
  }, [registeredNumbers]);

  const loginNumber = (number: string) => {
    const cleaned = number.trim();
    if (!cleaned) return false;
    if (!registeredNumbers.includes(cleaned)) return false;
    setMemberNumberState(cleaned);
    localStorage.setItem(MEMBER_NUMBER_KEY, cleaned);
    return true;
  };

  const addMemberNumber = (number: string) => {
    const cleaned = number.trim();
    if (!cleaned) return false;
    setRegisteredNumbers((prev) => {
      if (prev.includes(cleaned)) return prev;
      const next = [...prev, cleaned];
      localStorage.setItem(REGISTERED_NUMBERS_KEY, JSON.stringify(next));
      return next;
    });
    return true;
  };

  const logoutMember = () => {
    setMemberNumberState("");
    localStorage.removeItem(MEMBER_NUMBER_KEY);
  };

  const isNumberRegistered = (number: string) => registeredNumbers.includes(number.trim());

  const value = useMemo(() => ({
    memberNumber,
    isMember: memberNumber.trim().length > 0 && registeredNumbers.includes(memberNumber.trim()),
    registeredNumbers,
    loginNumber,
    addMemberNumber,
    logoutMember,
    isNumberRegistered,
    description:
      memberNumber.trim().length > 0 && registeredNumbers.includes(memberNumber.trim())
        ? "Registered member: offers enabled"
        : "Not registered: login with your shop membership number",
  }), [memberNumber, registeredNumbers]);

  return <MemberContext.Provider value={value}>{children}</MemberContext.Provider>;
}

export function useMember() {
  const context = useContext(MemberContext);
  if (!context) throw new Error("useMember must be used within MemberProvider");
  return context;
}
