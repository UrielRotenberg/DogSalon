import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [user, setUser] = useState({
    username: '',
    passwordHash: '',
    firstName: ''
  });

  const handleRegister = async () => {
    try {
      const response = await axios.post('https://localhost:7133/api/Auth/register', user);
      alert("נרשמת בהצלחה! הודעת השרת: " + response.data.message);
    } catch (error) {
      console.error(error);
      alert("שגיאה ברישום: " + (error.response?.data || error.message));
    }
  };

  return (
    <div className="registration-container" style={{ direction: 'rtl' }}>
      <h1>רישום למספרת הכלבים 🐶</h1>
      
      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '300px', margin: '0 auto' }}>
          <input 
            type="text" 
            placeholder="שם פרטי" 
            onChange={(e) => setUser({...user, firstName: e.target.value})} 
          />
          <input 
            type="text" 
            placeholder="שם משתמש" 
            onChange={(e) => setUser({...user, username: e.target.value})} 
          />
          <input 
            type="password" 
            placeholder="סיסמה" 
            onChange={(e) => setUser({...user, passwordHash: e.target.value})} 
          />
          <button onClick={handleRegister}>
            צור חשבון חדש
          </button>
        </div>
      </div>

      <p className="read-the-docs">
        הנתונים יישמרו ישירות בבסיס הנתונים SQL Server
      </p>
    </div>
  )
}

export default App