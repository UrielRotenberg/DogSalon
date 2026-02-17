import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null); 
  const [myAppointments, setMyAppointments] = useState([]);
  
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

  const fetchAppointments = async (userId) => {
    try {
      const response = await axios.get(`https://localhost:7133/api/Appointments/user/${userId}`);
      setMyAppointments(response.data);
    } catch (error) {
      console.error("שגיאה בטעינת תורים:", error);
    }
  };

  const handleAuth = async () => {
    const endpoint = isLogin ? 'login' : 'register';
    try {
      const response = await axios.post(`https://localhost:7133/api/Auth/${endpoint}`, formData);
      
      if (isLogin) {
        const loggedInUser = {
          id: response.data.userId,
          name: response.data.firstName
        };
        setUser(loggedInUser);
        fetchAppointments(loggedInUser.id);
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
    if (!appointmentData.dogName || !appointmentData.appointmentDate) {
      alert("נא למלא שם כלב ותאריך");
      return;
    }

    try {
      const dataToSend = {
        ...appointmentData,
        userId: user.id
      };
      
      await axios.post('https://localhost:7133/api/Appointments', dataToSend);
      alert("התור נקבע בהצלחה!");
      setAppointmentData({ dogName: '', serviceType: 'תספורת', appointmentDate: '' });
      fetchAppointments(user.id);
    } catch (error) {
      alert("שגיאה בקביעת התור");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("בטוח שברצונך לבטל את התור?")) {
      try {
        await axios.delete(`https://localhost:7133/api/Appointments/${id}`);
        fetchAppointments(user.id);
      } catch (error) {
        alert("שגיאה בביטול התור");
      }
    }
  };

  if (user) {
    return (
      <div className="card" style={{ direction: 'rtl', width: '900px', maxWidth: '95vw' }}>
        <h1>שלום, {user.name}! 🐾</h1>
        
        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
          
          <div style={{ flex: 1, minWidth: '300px', textAlign: 'right' }}>
            <h3>קבע תור חדש:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
            </div>
          </div>

          <div style={{ flex: 1.5, minWidth: '350px' }}>
            <h3>התורים שלי:</h3>
            {myAppointments.length === 0 ? (
              <p>אין לך תורים רשומים כרגע.</p>
            ) : (
              <table border="1" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#2a2a2a' }}>
                <thead>
                  <tr style={{ backgroundColor: '#444' }}>
                    <th>כלב</th>
                    <th>שירות</th>
                    <th>תאריך</th>
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {myAppointments.map(app => (
                    <tr key={app.id}>
                      <td>{app.dogName}</td>
                      <td>{app.serviceType}</td>
                      <td>{new Date(app.appointmentDate).toLocaleString('he-IL')}</td>
                      <td>
                        <button 
                          onClick={() => handleDelete(app.id)} 
                          style={{ backgroundColor: '#ff4444', padding: '5px 10px', fontSize: '12px' }}
                        >
                          ביטול
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        <button 
          style={{ marginTop: '40px', backgroundColor: '#666', width: '150px' }} 
          onClick={() => setUser(null)}
        >
          התנתק
        </button>
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
          <p 
            style={{ cursor: 'pointer', color: '#646cff', marginTop: '10px' }} 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'עדיין אין לך חשבון? הירשם כאן' : 'כבר רשום? התחבר כאן'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;