import { useState } from 'react';
import { api } from '../services/api';
import { notify } from '../utils/toast';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', passwordHash: '', firstName: '' });
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setAttemptedSubmit(false);
        setFormData({ username: '', passwordHash: '', firstName: '' });
    };

    const handleAuth = async () => {
        setAttemptedSubmit(true);

        const isFirstNameMissing = !isLogin && !formData.firstName;
        const isUsernameMissing = !formData.username;
        const isPasswordMissing = !formData.passwordHash;

        if (isFirstNameMissing || isUsernameMissing || isPasswordMissing) {
            notify.error("אנא מלא את כל שדות החובה 🛑");
            return;
        }

        try {
            if (isLogin) {
                const res = await api.login(formData);
                notify.success(`שלום ${res.data.firstName}, התחברת בהצלחה! 🐾`);
                setTimeout(() => {
                    setUser({ id: res.data.userId, name: res.data.firstName });
                }, 800);
            } else {
                await api.register(formData);
                notify.success("החשבון נוצר בהצלחה! ✨ עבור להתחברות");
                setIsLogin(true);
                setAttemptedSubmit(false);
                setFormData({ username: '', passwordHash: '', firstName: '' });
            }
        } catch (e) {
            if (e.response) {
                const status = e.response.status;
                if (isLogin) {
                    if (status === 401 || status === 404) notify.warn("שם משתמש או סיסמה לא נכונים ⚠️");
                    else notify.error("אירעה שגיאה בכניסה למערכת ❌");
                } else {
                    if (status === 400 || status === 409) notify.warn("שם המשתמש כבר קיים במערכת ⚠️");
                    else notify.error("אירעה שגיאה ביצירת החשבון ❌");
                }
            } else {
                notify.error("אין תקשורת עם השרת 🌐");
            }
        }
    };

    const logout = () => {
        setUser(null);
        setIsLogin(true);
        setAttemptedSubmit(false);
        setFormData({ username: '', passwordHash: '', firstName: '' });
        notify.info("התנתקת בהצלחה. 👋");
    };

    return { 
        user, isLogin, formData, setFormData, 
        attemptedSubmit, toggleAuthMode, handleAuth, logout 
    };
};