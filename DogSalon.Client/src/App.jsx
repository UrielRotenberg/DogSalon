import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    passwordHash: '',
    firstName: ''
  });

  const [appointmentData, setAppointmentData] = useState({
    dogName: '',
    serviceType: 'תספורת',
    appointmentDate: ''
  });

  const handleAuth = async () => {
    const endpoint = isLogin ? 'login' : 'register';
    try {
      const response = await axios.post(`https://localhost:7133/api/Auth/${endpoint}`, formData);
      
      if (isLogin) {
        setUser({
          id: response.data.userId,
          name: response.data.firstName
        });
      } else {
        alert("נרשמת בהצלחה! עבור להתחברות.");
        setIsLogin(true);
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || "שגיאה במערכת";
      alert("שגיאה: " + msg);
    }
  };

  const handleBookAppointment = async () => {
    try {
      const dataToSend = {
        ...appointmentData,
        userId: user.id 
      };
      
      await axios.post('https://localhost:7133/api/Appointments', dataToSend);
      alert("התור נקבע בהצלחה בבסיס הנתונים!");
      setAppointmentData({ dogName: '', serviceType: 'תספורת', appointmentDate: '' });
    } catch (error) {
      alert("שגיאה בקביעת התור. וודא שהזנת תאריך תקין.");
    }
  };

  if (user) {
    return (
      <div className="card" style={{ direction: 'rtl' }}>
        <h1>שלום, {user.name}! 🐾</h1>
        <p>קבע תור חדש למספרה:</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
          <input 
            type="text" 
            placeholder="שם הכלב" 
            value={appointmentData.dogName}
            onChange={(e) => setAppointmentData({...appointmentData, dogName: e.target.value})} 
          />
          <select 
            value={appointmentData.serviceType}
            onChange={(e) => setAppointmentData({...appointmentData, serviceType: e.target.value})}
          >
            <option value="תספורת">תספורת</option>
            <option value="רחצה">רחצה</option>
            <option value="גזירת ציפורניים">גזירת ציפורניים</option>
          </select>
          <input 
            type="datetime-local" 
            value={appointmentData.appointmentDate}
            onChange={(e) => setAppointmentData({...appointmentData, appointmentDate: e.target.value})} 
          />
          <button onClick={handleBookAppointment}>קבע תור עכשיו</button>
          <button style={{ backgroundColor: '#ff4444' }} onClick={() => setUser(null)}>התנתק</button>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-container" style={{ direction: 'rtl' }}>
      <h1>{isLogin ? 'כניסה למערכת' : 'רישום למספרה'} 🐶</h1>
      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '300px', margin: '0 auto' }}>
          {!isLogin && (
            <input 
              type="text" 
              placeholder="שם פרטי" 
              onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
            />
          )}
          <input 
            type="text" 
            placeholder="שם משתמש" 
            onChange={(e) => setFormData({...formData, username: e.target.value})} 
          />
          <input 
            type="password" 
            placeholder="סיסמה" 
            onChange={(e) => setFormData({...formData, passwordHash: e.target.value})} 
          />
          <button onClick={handleAuth}>
            {isLogin ? 'התחבר' : 'צור חשבון'}
          </button>
          <p style={{ cursor: 'pointer', color: '#646cff' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'עדיין אין לך חשבון? הירשם כאן' : 'כבר רשום? התחבר כאן'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;