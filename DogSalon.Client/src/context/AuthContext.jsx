import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

const AuthContext = createContext(null);

function safeJsonParse(value) {
  try { return JSON.parse(value); } catch { return null; }
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
  } catch { return null; }
}

export function AuthProvider({ children }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [auth, setAuth] = useState({ token: null, user: null });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = safeJsonParse(localStorage.getItem("user"));
    setAuth({ token: token ?? null, user: user ?? null });
    setIsHydrated(true);
  }, []);

  const value = useMemo(() => {
    const login = ({ token, user: nextUser }) => {
      const payload = decodeJwtPayload(token);
      const role = payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload?.role;
      const firstName = payload?.firstName || nextUser?.firstName;
      
      const mergedUser = { 
        ...nextUser, 
        userId: payload?.userId ? Number(payload.userId) : nextUser?.userId,
        firstName, 
        role 
      };

      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(mergedUser));
      setAuth({ token, user: mergedUser });
    };

    const logout = () => {
      localStorage.clear();
      setAuth({ token: null, user: null });
    };

    return { 
      token: auth.token, 
      user: auth.user, 
      role: auth.user?.role,
      isAuthenticated: !!auth.token, 
      isHydrated, 
      login, 
      logout 
    };
  }, [auth, isHydrated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);