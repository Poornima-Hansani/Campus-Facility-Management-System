import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type UserRole = "student" | "admin" | "staff" | "management" | "lecturer";

const STORAGE_KEY = "unifiedRole";

type AuthContextValue = {
  role: UserRole;
  isAdmin: boolean;
  isStaff: boolean;
  isManagement: boolean;
  loginAsStudent: () => void;
  loginAsAdmin: (password: string) => boolean;
  logoutToStudent: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredRole(): UserRole {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "admin" || v === "student" || v === "staff" || v === "management" || v === "lecturer") return v as UserRole;
  } catch {
    /* ignore */
  }
  return "student";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(() => readStoredRole());

  const persist = useCallback((r: UserRole) => {
    setRole(r);
    try {
      localStorage.setItem(STORAGE_KEY, r);
    } catch {
      /* ignore */
    }
  }, []);

  const loginAsStudent = useCallback(() => {
    persist("student");
  }, [persist]);

  const loginAsAdmin = useCallback(
    (password: string) => {
      const expected =
        import.meta.env.VITE_ADMIN_PASSWORD ?? "poorni123";
      if (password === expected) {
        persist("admin");
        return true;
      }
      return false;
    },
    [persist]
  );

  const loginAsLecturer = useCallback(() => {
    persist("lecturer");
  }, [persist]);

  const logoutToStudent = useCallback(() => {
    persist("student");
  }, [persist]);

  const value = useMemo<AuthContextValue>(
    () => ({
      role,
      isAdmin: role === "admin",
      isStaff: role === "staff",
      isManagement: role === "management",
      loginAsStudent,
      loginAsAdmin,
      loginAsLecturer,
      logoutToStudent,
    }),
    [role, loginAsStudent, loginAsAdmin, loginAsLecturer, logoutToStudent]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

/** Consumer hook for `AuthProvider`. */
// eslint-disable-next-line react-refresh/only-export-components -- hook must live next to context
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
