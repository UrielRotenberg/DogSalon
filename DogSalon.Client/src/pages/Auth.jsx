import React from 'react';
import styles from './Auth.module.css';

const Auth = ({ isLogin, setIsLogin, formData, setFormData, handleAuth, attemptedSubmit }) => {
  
  const onSubmit = (e) => {
    e.preventDefault();
    handleAuth();
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <div className={styles.logoContainer}>
          <span className={styles.logoIcon}>🐾</span>
          <h1 className={styles.logoText}>DogStyle</h1>
          <p className={styles.logoSub}>מספרת בוטיק לכלבים</p>
        </div>

        <h2 className={styles.authTitle}>
          {isLogin ? 'התחברות למערכת' : 'הרשמה למערכת'}
        </h2>

        <form className={styles.inputFields} onSubmit={onSubmit}>
          
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label>שם פרטי</label>
              <input
                type="text"
                className={attemptedSubmit && !formData.firstName ? styles.errorField : ''}
                placeholder="הכנס שם פרטי"
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label>שם משתמש</label>
            <input
              type="text"
              className={attemptedSubmit && !formData.username ? styles.errorField : ''}
              placeholder="שם משתמש"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>סיסמה</label>
            <input
              type="password"
              className={attemptedSubmit && !formData.passwordHash ? styles.errorField : ''}
              placeholder="סיסמה"
              value={formData.passwordHash}
              onChange={(e) => setFormData({ ...formData, passwordHash: e.target.value })}
            />
          </div>

          {!isLogin && (
            <div className={styles.adminSection}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isAdminRequested || false}
                  onChange={(e) => setFormData({ ...formData, isAdminRequested: e.target.checked })}
                />
                <span>בקשת חשבון מנהל</span>
              </label>

              {formData.isAdminRequested && (
                <div className={styles.inputGroup}>
                  <label>קוד אישור מנהל</label>
                  <input
                    type="password"
                    placeholder="הזן קוד סודי למנהלים"
                    value={formData.adminCode || ''}
                    onChange={(e) => setFormData({ ...formData, adminCode: e.target.value })}
                    className={attemptedSubmit && !formData.adminCode ? styles.errorField : ''}
                  />
                </div>
              )}
            </div>
          )}

          <button type="submit" className={styles.submitBtn}>
            {isLogin ? 'התחברות' : 'סיום הרשמה'}
          </button>
        </form>

        <p className={styles.authSwitch}>
          {isLogin ? 'חדש ב-DogStyle?' : 'כבר יש לך חשבון?'}
          <span className={styles.switchLink} onClick={setIsLogin}>
            {isLogin ? 'צור חשבון חדש' : 'התחבר עכשיו'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;