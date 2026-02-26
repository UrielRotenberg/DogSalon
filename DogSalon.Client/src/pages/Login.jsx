import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Auth from "./Auth";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { notify } from "../utils/toast";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from || "/";
  const [isLogin, setIsLogin] = useState(true);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [loading, setLoading] = useState(false);

  const initialFormData = {
    firstName: "",
    username: "",
    passwordHash: "",
    isAdminRequested: false,
    adminCode: ""
  };

  const [formData, setFormData] = useState(initialFormData);

  const validate = () => {
    if (!formData.username?.trim()) return false;
    if (!formData.passwordHash?.trim()) return false;
    if (!isLogin && !formData.firstName?.trim()) return false;
    if (!isLogin && formData.isAdminRequested && !formData.adminCode?.trim()) return false;
    return true;
  };

  const handleAuth = async () => {
    setAttemptedSubmit(true);
    if (!validate()) {
      notify.warn("אנא מלא את כל שדות החובה 🛑");
      return;
    }

    if (!isLogin && formData.isAdminRequested && formData.adminCode !== "DS2026") {
      notify.error("קוד מנהל שגוי ❌");
      return;
    }

    try {
      setLoading(true);
      let res;

      if (isLogin) {
        res = await api.login({
          username: formData.username,
          password: formData.passwordHash,
        });
        notify.success(`שלום ${res.data.firstName || 'אורח'}, התחברת בהצלחה! 🐾`);
      } else {
        res = await api.register({
          firstName: formData.firstName,
          username: formData.username,
          password: formData.passwordHash,
          role: formData.isAdminRequested ? "admin" : "customer",
          adminCode: formData.adminCode 
        });
        notify.success("החשבון נוצר בהצלחה! ✨ כעת ניתן להתחבר");
        setFormData(initialFormData);
        setIsLogin(true);
        setAttemptedSubmit(false);
        return; 
      }

      const { token, userId, firstName } = res.data;

      login({
        token,
        user: {
          userId,
          firstName,
          username: formData.username,
        },
      });

      navigate(from, { replace: true });
    } catch (err) {
      notify.error(err?.normalizedMessage || "הפעולה נכשלה ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Auth
      isLogin={isLogin}
      setIsLogin={() => {
        setFormData(initialFormData);
        setAttemptedSubmit(false);
        setIsLogin((prev) => !prev);
      }}
      formData={formData}
      setFormData={setFormData}
      handleAuth={handleAuth}
      attemptedSubmit={attemptedSubmit}
      loading={loading}
    />
  );
}