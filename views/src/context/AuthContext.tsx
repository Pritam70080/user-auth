import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiRequest, jsonBody, type User } from "../lib/api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionChanged = useRef(false);
  const sessionInitialization = useRef<Promise<User | null> | null>(null);

  useEffect(() => {
    let active = true;
    let initialization = sessionInitialization.current;
    if (!initialization) {
      initialization = apiRequest<User>("/profile", { method: "GET" }, true)
        .then((response) => response.data)
        .catch(() => null);
      sessionInitialization.current = initialization;
    }

    void initialization
      .then((profile) => {
        if (active && !sessionChanged.current) {
          setUser(profile);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiRequest<User>("/login", {
      method: "POST",
      body: jsonBody({ email, password }),
    });
    if (!response.data) {
      throw new Error("The login response did not include a user.");
    }
    sessionChanged.current = true;
    setUser(response.data);
    return response.data;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    await apiRequest<null>("/register", {
      method: "POST",
      body: jsonBody({ name, email, password }),
    });
  }, []);

  const logout = useCallback(async () => {
    await apiRequest<null>("/logout", { method: "GET" }, true);
    sessionChanged.current = true;
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout }),
    [user, loading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
