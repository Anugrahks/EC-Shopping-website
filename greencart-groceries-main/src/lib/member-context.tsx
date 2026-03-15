import { createContext, useContext, useEffect, useMemo, useState } from "react";

const MEMBER_NUMBER_KEY = "gc_member_number";
const REGISTERED_NUMBERS_KEY = "gc_registered_numbers";

type MemberContextType = {
  memberNumber: string;
  isMember: boolean;
  registeredNumbers: string[];
  setMemberNumber: (number: string) => void;
  registerNumber: (number: string) => void;
  logoutMember: () => void;
  isNumberRegistered: (number: string) => boolean;
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
        setRegisteredNumbers([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(MEMBER_NUMBER_KEY, memberNumber);
  }, [memberNumber]);

  useEffect(() => {
    localStorage.setItem(REGISTERED_NUMBERS_KEY, JSON.stringify(registeredNumbers));
  }, [registeredNumbers]);

  const setMemberNumber = (number: string) => {
    const cleaned = number.trim();
    setMemberNumberState(cleaned);
    localStorage.setItem(MEMBER_NUMBER_KEY, cleaned);
  };

  const registerNumber = (number: string) => {
    const cleaned = number.trim();
    if (!cleaned) return;
    setRegisteredNumbers((prev) => {
      if (prev.includes(cleaned)) return prev;
      const next = [...prev, cleaned];
      localStorage.setItem(REGISTERED_NUMBERS_KEY, JSON.stringify(next));
      return next;
    });
    setMemberNumber(cleaned);
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
    setMemberNumber,
    registerNumber,
    logoutMember,
    isNumberRegistered,
  }), [memberNumber, registeredNumbers]);

  return <MemberContext.Provider value={value}>{children}</MemberContext.Provider>;
}

export function useMember() {
  const context = useContext(MemberContext);
  if (!context) throw new Error("useMember must be used within MemberProvider");
  return context;
}
