import { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import { notify } from "../utils/toast"; 
import AppointmentForm from "../components/AppointmentForm";
import AppointmentTables from "../components/AppointmentTables";
import styles from "./Dashboard.module.css";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [myAppointments, setMyAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [appointmentData, setAppointmentData] = useState({
    dogName: "",
    dogSize: "קטן",
    dateOnly: "",
    timeOnly: "",
    price: 0,
    discount: 0,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const displayName = user?.firstName || user?.username || "משתמש";

  const isSameDay = (dateString) => {
    if (!dateString) return false;
    const today = new Date().toLocaleDateString("en-CA");
    const appointmentDate = dateString.split("T")[0];
    return today === appointmentDate;
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const mine = await api.getMyAppointments();
      const sortFn = (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate);
      setMyAppointments((mine.data || []).sort(sortFn));

      const queue = await api.getQueue(); 
      setAllAppointments((queue.data || []).sort(sortFn));
      
    } catch (e) {
      notify.error(e?.normalizedMessage || "שגיאה בטעינת נתונים ❌");
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const handleSave = async () => {
    try {
      const dateTime = `${appointmentData.dateOnly}T${appointmentData.timeOnly}:00`;
      const payload = {
        dogName: appointmentData.dogName,
        dogSize: appointmentData.dogSize,
        appointmentDate: dateTime,
      };

      if (editingId) {
        await api.updateAppointment(editingId, payload);
        notify.success("התור עודכן בהצלחה! ✨");
      } else {
        await api.createAppointment(payload);
        notify.success("התור נקבע בהצלחה! 🐶");
      }

      resetForm();
      fetchData();
    } catch (e) {
      notify.error(e?.normalizedMessage || "הפעולה נכשלה ❌");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setAppointmentData({
      dogName: "",
      dogSize: "קטן",
      dateOnly: "",
      timeOnly: "",
      price: 0,
      discount: 0,
    });
  };

  const confirmDelete = async () => {
    try {
      await api.deleteAppointment(idToDelete);
      notify.success("התור בוטל בהצלחה 🧹");
      setShowDeleteModal(false);
      fetchData();
    } catch (e) {
      notify.error(e?.normalizedMessage || "ביטול התור נכשל ❌");
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
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "18px" }}>🐾</span>
            <h1 className={styles.logoTitle}>DogStyle</h1>
            <p className={styles.logoSubTitle}>מספרת בוטיק לכלבים</p>
          </div>
        </div>
        <div className={styles.liveClock}>
          {currentTime.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userText}>
            <span className={styles.welcomeLabel}>מחובר: {displayName}</span>
            <button onClick={logout} className={styles.logoutBtnOld}>התנתק</button>
          </div>
        </div>
      </header>

      <main className={styles.mainLayout}>
        <section className={styles.formSection}>
          <AppointmentForm
            appointmentData={appointmentData}
            setAppointmentData={setAppointmentData}
            allAppointments={allAppointments}
            editingId={editingId}
            handleBookOrUpdate={handleSave}
            resetForm={resetForm}
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
              setSelectedDate(date.toLocaleDateString("en-CA"));
            }}
            isEditingAnything={!!editingId}
            onEdit={(app) => {
              if (isSameDay(app.appointmentDate)) {
                notify.warn("לא ניתן לערוך תור ביום האירוע 🛑");
                return;
              }
              setEditingId(app.id);
              const appDate = new Date(app.appointmentDate);
              setAppointmentData({
                dogName: app.dogName,
                dogSize: app.dogSize,
                dateOnly: app.appointmentDate.split("T")[0],
                timeOnly: appDate.getHours().toString().padStart(2, "0") + ":" + appDate.getMinutes().toString().padStart(2, "0"),
                price: app.price,
                discount: app.discount,
              });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onDelete={(app) => {
              if (isSameDay(app.appointmentDate)) {
                notify.error("לא ניתן לבטל תור שחל היום 📞");
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