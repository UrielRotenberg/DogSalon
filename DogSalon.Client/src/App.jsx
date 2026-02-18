import { useAuth } from './hooks/useAuth';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const { 
    user, isLogin, formData, setFormData, 
    attemptedSubmit, toggleAuthMode, handleAuth, logout 
  } = useAuth();

  return (
    <div className="App">
      {!user ? (
        <Auth 
          isLogin={isLogin} 
          setIsLogin={toggleAuthMode} 
          formData={formData} 
          setFormData={setFormData} 
          handleAuth={handleAuth}
          attemptedSubmit={attemptedSubmit} 
        />
      ) : (
        <Dashboard user={user} onLogout={logout} />
      )}

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        theme="colored"
        rtl={true}
        pauseOnHover
        closeOnClick
      />
    </div>
  );
}

export default App;