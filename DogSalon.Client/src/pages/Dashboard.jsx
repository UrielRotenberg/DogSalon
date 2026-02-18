import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { notify } from '../utils/toast';
import AppointmentForm from '../components/AppointmentForm';
import AppointmentTables from '../components/AppointmentTables';
import styles from './Dashboard.module.css';

const Dashboard = ({ user, onLogout }) => {
  const [myAppointments, setMyAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [appointmentData, setAppointmentData] = useState({ 
    dogName: '', dogSize: 'קטן', dateOnly: '', timeOnly: '', price: 0, discount: 0 
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date().toLocaleDateString('en-CA');
    const appointmentDate = dateString.split('T')[0];
    return today === appointmentDate;
  };

  const dynamicHours = useMemo(() => {
    if (!appointmentData.dateOnly) return [];
    const date = new Date(appointmentData.dateOnly);
    const day = date.getDay(); 
    if (day === 6) return []; 
    const startHour = 9;
    const endHour = (day === 5) ? 14 : 19;
    const hours = [];
    for (let h = startHour; h < endHour; h++) {
      hours.push(`${h.toString().padStart(2, '0')}:00`, `${h.toString().padStart(2, '0')}:30`);
    }
    if (day === 5) hours.push("14:00");
    return hours;
  }, [appointmentData.dateOnly]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [mine, all] = await Promise.all([api.getMyAppointments(user.id), api.getAllAppointments()]);
      const sortFn = (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate);
      setMyAppointments(mine.data.sort(sortFn));
      setAllAppointments(all.data.sort(sortFn));
    } catch (e) { notify.error("שגיאה בטעינת נתונים ❌"); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    try {
      const dateTime = `${appointmentData.dateOnly}T${appointmentData.timeOnly}:00`;
      const payload = { ...appointmentData, appointmentDate: dateTime, userId: user.id };
      if (editingId) {
        await api.updateAppointment(editingId, payload);
        notify.success("התור עודכן בהצלחה! ✨");
      } else {
        await api.createAppointment(payload);
        notify.success("התור נקבע בהצלחה! 🐶");
      }
      resetForm();
      fetchData();
    } catch (e) { notify.error("הפעולה נכשלה ❌"); }
  };

  const resetForm = () => {
    setEditingId(null);
    setAppointmentData({ dogName: '', dogSize: 'קטן', dateOnly: '', timeOnly: '', price: 0, discount: 0 });
  };

  const confirmDelete = async () => {
    try {
      await api.deleteAppointment(idToDelete, user.id);
      notify.success("התור בוטל 🧹");
      setShowDeleteModal(false);
      fetchData();
    } catch (e) { 
      const errorMsg = e.response?.data?.message || e.response?.data || "ביטול נכשל ❌";
      notify.error(errorMsg); 
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <h3>ביטול תור 🐾</h3>
            <p>האם אתה בטוח שברצונך לבטל את התור?</p>
            <div className={styles.modalBtns}>
              <button className={styles.confirmBtn} onClick={confirmDelete}>כן, בטל תור</button>
              <button className={styles.cancelBtnModal} onClick={() => setShowDeleteModal(false)}>חזור</button>
            </div>
          </div>
        </div>
      )}

      <header className={styles.headerContainer}>
        <div className={styles.logoSection}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '18px' }}>🐾</span>
            <h1 className={styles.logoTitle}>DogStyle</h1>
            <p className={styles.logoSubTitle}>מספרת בוטיק לכלבים</p>
          </div>
        </div>
        <div className={styles.liveClock}>
          {currentTime.toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userText}>
            <span className={styles.welcomeLabel}>מחובר כעת: {user.name}</span>
            <button onClick={onLogout} className={styles.logoutBtnOld}>התנתק</button>
          </div>
        </div>
      </header>
      
      <main className={styles.mainLayout}>
        <section className={styles.formSection}>
          <AppointmentForm 
            appointmentData={appointmentData} setAppointmentData={setAppointmentData}
            availableHours={dynamicHours} allAppointments={allAppointments}
            editingId={editingId} handleBookOrUpdate={handleSave} resetForm={resetForm}
          />
        </section>

        <section className={styles.tableSection}>
          <AppointmentTables 
            myAppointments={myAppointments} 
            allAppointments={allAppointments}
            selectedDate={selectedDate}
            user={user}
            onDateChange={(offset) => {
              const date = new Date(selectedDate);
              date.setDate(date.getDate() + offset);
              setSelectedDate(date.toLocaleDateString('en-CA'));
            }}
            isEditingAnything={!!editingId}
            onEdit={(app) => {
                if (isToday(app.appointmentDate)) {
                    notify.warn("לא ניתן לערוך תור של היום 🛑");
                    return;
                }
                setEditingId(app.id);
                const appDate = new Date(app.appointmentDate);
                setAppointmentData({
                    dogName: app.dogName, dogSize: app.dogSize,
                    dateOnly: app.appointmentDate.split('T')[0],
                    timeOnly: appDate.getHours().toString().padStart(2, '0') + ':' + appDate.getMinutes().toString().padStart(2, '0'),
                    price: app.price, discount: app.discount
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
            onDelete={(app) => {
                if (isToday(app.appointmentDate)) {
                    notify.warn("לא ניתן לבטל תור של היום 🛑");
                    return;
                }
                setIdToDelete(app.id);
                setShowDeleteModal(true);
            }}
            setSelectedDate={setSelectedDate}
          />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;