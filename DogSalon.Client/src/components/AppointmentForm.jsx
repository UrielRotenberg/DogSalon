import React, { useState, useMemo } from 'react';
import { notify } from '../utils/toast';
import styles from './AppointmentForm.module.css';

const AppointmentForm = ({ 
  appointmentData, setAppointmentData, allAppointments, 
  editingId, handleBookOrUpdate, resetForm 
}) => {
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const serviceDetails = {
    'קטן': { price: 100, duration: 30 },
    'בינוני': { price: 150, duration: 60 },
    'גדול': { price: 200, duration: 90 }
  };

  const basePrices = { 'קטן': 100, 'בינוני': 150, 'גדול': 200 };

  const isTimeOccupied = (timeSlot) => {
    if (!appointmentData.dateOnly) return false;

    const selectedStart = new Date(`${appointmentData.dateOnly}T${timeSlot}:00`);
    const selectedDuration = serviceDetails[appointmentData.dogSize]?.duration || 30;
    const selectedEnd = new Date(selectedStart.getTime() + selectedDuration * 60000);

    return allAppointments.some(app => {
      if (app.id === editingId) return false;

      const appStart = new Date(app.appointmentDate);
      const appDuration = app.durationMinutes || serviceDetails[app.dogSize]?.duration || 30;
      const appEnd = new Date(appStart.getTime() + appDuration * 60000);

      return (selectedStart < appEnd && selectedEnd > appStart);
    });
  };

  const dynamicAvailableHours = useMemo(() => {
    if (!appointmentData.dateOnly) return [];
    const selectedDate = new Date(appointmentData.dateOnly);
    const dayOfWeek = selectedDate.getDay(); 
    
    if (dayOfWeek === 6) return [];

    const endHour = (dayOfWeek === 5) ? 14 : 19;
    const hours = [];
    
    for (let h = 9; h < endHour; h++) {
      const hourStr = h.toString().padStart(2, '0');
      hours.push(`${hourStr}:00`);
      hours.push(`${hourStr}:30`);
    }
    if (dayOfWeek === 5) hours.push("14:00"); 
    
    return hours;
  }, [appointmentData.dateOnly]);

  const isTimeInPast = (time) => {
    if (!appointmentData.dateOnly) return false;
    const now = new Date();
    const selectedDate = new Date(appointmentData.dateOnly);
    if (selectedDate.toDateString() === now.toDateString()) {
      const [hours, minutes] = time.split(':');
      const timeToCheck = new Date();
      timeToCheck.setHours(parseInt(hours), parseInt(minutes), 0);
      return now > timeToCheck;
    }
    return selectedDate < now && selectedDate.toDateString() !== now.toDateString();
  };

  const onSaveClick = () => {
    setAttemptedSubmit(true);
    if (!appointmentData.dogName || !appointmentData.dateOnly || !appointmentData.timeOnly) {
      notify.error("אנא מלא את כל שדות החובה 🛑");
      return;
    }
    handleBookOrUpdate();
    setAttemptedSubmit(false);
  };

  return (
    <div className={styles.formCard}>
      <h3 className={styles.formTitle}>
        {editingId ? '📝 עריכת תור' : '📅 קביעת תור חדש'}
      </h3>
      
      <div className={styles.inputsWrapper}>
        <input 
          className={`${styles.inputField} ${attemptedSubmit && !appointmentData.dogName ? styles.errorBorder : ''}`}
          type="text" 
          placeholder="שם הכלב..." 
          value={appointmentData.dogName} 
          onChange={(e) => setAppointmentData({...appointmentData, dogName: e.target.value})} 
        />
        
        <select 
          className={styles.selectField}
          value={appointmentData.dogSize} 
          onChange={(e) => {
            const newSize = e.target.value;
            const newBasePrice = basePrices[newSize];
            const currentBase = basePrices[appointmentData.dogSize];
            const currentDiscountPercent = appointmentData.discount || Math.round(((currentBase - appointmentData.price) / currentBase) * 100);
            const updatedPrice = newBasePrice - (newBasePrice * (currentDiscountPercent / 100));
            
            setAppointmentData({
                ...appointmentData, 
                dogSize: newSize, 
                price: updatedPrice,
                discount: currentDiscountPercent
            });
          }}
        >
          <option value="קטן">🐶 קטן (30 דק' - 100 ₪)</option>
          <option value="בינוני">🐩 בינוני (60 דק' - 150 ₪)</option>
          <option value="גדול">🐕 גדול (90 דק' - 200 ₪)</option>
        </select>

        <input 
          className={`${styles.inputField} ${attemptedSubmit && !appointmentData.dateOnly ? styles.errorBorder : ''}`}
          type="date" 
          min={new Date().toISOString().split('T')[0]}
          value={appointmentData.dateOnly} 
          onChange={(e) => {
            const date = new Date(e.target.value);
            if (date.getDay() === 6) {
              notify.error("המספרה סגורה בשבת וחג 🚩");
              setAppointmentData({...appointmentData, dateOnly: '', timeOnly: ''});
            } else {
              setAppointmentData({...appointmentData, dateOnly: e.target.value, timeOnly: ''});
            }
          }} 
        />

        {appointmentData.dateOnly ? (
          <div className={`${styles.timeGrid} ${attemptedSubmit && !appointmentData.timeOnly ? styles.errorGrid : ''}`}>
            {dynamicAvailableHours.map(hour => {
              const isTaken = isTimeOccupied(hour);
              const passed = isTimeInPast(hour);
              const isDisabled = isTaken || passed;

              return (
                <button
                  key={hour}
                  type="button"
                  disabled={isDisabled}
                  className={`${styles.timeSlot} ${isTaken ? styles.takenTime : ''} ${passed ? styles.passedTime : ''} ${appointmentData.timeOnly === hour ? styles.selectedTime : ''}`}
                  onClick={() => setAppointmentData({...appointmentData, timeOnly: hour})}
                >
                  {hour}
                </button>
              );
            })}
          </div>
        ) : (
          <p className={styles.helperText}>בחר תאריך לצפייה בשעות פנויות</p>
        )}

        <button className={styles.submitBtn} onClick={onSaveClick}>
          {editingId ? 'אשר שינויים' : 'קבע תור'}
        </button>
        
        {editingId && (
          <button className={styles.cancelBtn} onClick={() => { resetForm(); setAttemptedSubmit(false); }}>
            ביטול עריכה
          </button>
        )}

       <div className={styles.businessHours}>
          <h4 className={styles.hoursTitle}>🕒 שעות פעילות</h4>
          
          <div className={styles.hoursGrid}>
            <div className={styles.hoursRow}>
              <span className={styles.dayLabel}>א' - ה'</span>
              <span className={styles.timeLabel}>09:00 - 19:00</span>
            </div>
            <div className={styles.hoursRow}>
              <span className={styles.dayLabel}>שישי</span>
              <span className={styles.timeLabel}>09:00 - 14:30</span>
            </div>
            <div className={`${styles.hoursRow} ${styles.closedRow}`}>
              <span className={styles.dayLabel}>שבת</span>
              <span className={styles.timeLabel}>סגור 🚩</span>
            </div>
          </div>

          <div className={styles.contactFooter}>
            <div className={styles.contactPill}>
              <span className={styles.pillIcon}>📍</span>
              <span>רח' אימבר 14, פתח תקווה</span>
            </div>
            <div className={styles.contactPill}>
              <span className={styles.pillIcon}>📞</span>
              <span>03-3737392</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;