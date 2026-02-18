import React, { useState } from 'react';
import styles from './AppointmentTables.module.css';

const AppointmentTables = ({
    myAppointments, allAppointments, selectedDate, onDateChange, onEdit, onDelete, setSelectedDate, isEditingAnything, user
}) => {
    const [filterName, setFilterName] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [selectedAppDetails, setSelectedAppDetails] = useState(null);

    const getLocalDateString = (date = new Date()) => {
        return date.toLocaleDateString('en-CA');
    };

    const isTodayApp = (dateStr) => {
        const today = getLocalDateString();
        return dateStr?.split('T')[0] === today;
    };

    const getDurationMinutes = (size) => {
        switch (size) {
            case 'גדול': return 90;
            case 'בינוני': return 60;
            case 'קטן': return 30;
            default: return 30;
        }
    };

    const getEndTime = (startDateStr, dogSize) => {
        const start = new Date(startDateStr);
        const duration = getDurationMinutes(dogSize);
        const end = new Date(start.getTime() + duration * 60000);
        return end.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    };

    const calculateDiscount = (app) => {
        if (app.discount && app.discount > 0) return `${app.discount}%`;
        const basePrices = { 'קטן': 100, 'בינוני': 150, 'גדול': 200 };
        const basePrice = basePrices[app.dogSize] || 0;
        if (app.price < basePrice && basePrice > 0) {
            const discountPercent = Math.round(((basePrice - app.price) / basePrice) * 100);
            return `${discountPercent}%`;
        }
        return null;
    };

    const formatTime = (d) => new Date(d).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    const formatDateFull = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
    };
    const formatDayOnly = (dateStr) => new Date(dateStr).toLocaleDateString('he-IL', { weekday: 'long' });

    const getStatus = (appointmentDate, dogSize) => {
        const appTime = new Date(appointmentDate);
        const now = new Date();
        const duration = getDurationMinutes(dogSize);
        const diffInMinutes = (now - appTime) / (1000 * 60);
        const isToday = getLocalDateString(now) === appointmentDate?.split('T')[0];
        if (!isToday) {
            return now > appTime ? { label: 'הסתיים', class: styles.statusPast, isLocked: true } : { label: 'ממתין', class: styles.statusFuture, isLocked: false };
        }
        if (diffInMinutes >= duration) return { label: 'הסתיים', class: styles.statusPast, isLocked: true };
        if (diffInMinutes >= 0 && diffInMinutes < duration) return { label: 'בטיפול ✂️', class: styles.statusNow, isLocked: true };
        return { label: 'ממתין', class: styles.statusFuture, isLocked: false };
    };
    const activeMyAppointments = myAppointments.filter(app => getStatus(app.appointmentDate, app.dogSize).label !== 'הסתיים');
    const historyMyAppointments = myAppointments.filter(app => getStatus(app.appointmentDate, app.dogSize).label === 'הסתיים');
    const currentTableData = showHistory ? historyMyAppointments : activeMyAppointments;
    const filteredDaily = allAppointments.filter(app => {
        const matchesName = (app.dogName?.toLowerCase().includes(filterName.toLowerCase()) ||
            app.firstName?.toLowerCase().includes(filterName.toLowerCase()));
        if (filterName.trim() !== '') return matchesName;
        return app.appointmentDate?.startsWith(selectedDate);
    });

    return (
        <div className={styles.tableCard}>
            {selectedAppDetails && (
                <div className={styles.modalOverlay} onClick={() => setSelectedAppDetails(null)}>
                    <div className={styles.detailsModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>כרטיס תור: {selectedAppDetails.dogName} 🐾</h3>
                            <span className={styles.closeBtn} onClick={() => setSelectedAppDetails(null)}>&times;</span>
                        </div>
                        <div className={styles.modalContent}>
                            <div className={styles.detailItem}><span className={styles.detailLabel}>לקוח:</span><span className={styles.detailValue}>{selectedAppDetails.userId === user?.id ? (user?.name || 'אני') : (selectedAppDetails.firstName || 'לא ידוע')}</span></div>
                            <div className={styles.detailItem}><span className={styles.detailLabel}>סוג כלב:</span><span className={styles.detailValue}>{selectedAppDetails.dogSize}</span></div>
                            <div className={styles.detailItem}><span className={styles.detailLabel}>זמן טיפול:</span><span className={styles.detailValue}>{formatTime(selectedAppDetails.appointmentDate)} - {getEndTime(selectedAppDetails.appointmentDate, selectedAppDetails.dogSize)}</span></div>
                            <div className={styles.detailItem}><span className={styles.detailLabel}>תאריך:</span><span className={styles.detailValue}>{formatDateFull(selectedAppDetails.appointmentDate)}</span></div>
                            {selectedAppDetails.userId === user?.id ? (
                                <>
                                    <div className={styles.detailItem}><span className={styles.detailLabel}>הנחה:</span><span className={styles.detailValue}>{calculateDiscount(selectedAppDetails) || 'ללא הנחה'}</span></div>
                                    <div className={styles.detailItem}><span className={styles.detailLabel}>מחיר:</span><span className={styles.detailValuePrice}>{selectedAppDetails.price} ₪</span></div>
                                </>
                            ) : <div className={styles.privacyNote}>פרטי תשלום חסויים 🔒</div>}
                            <div className={styles.creationFooter}>תור זה נוצר בתאריך: {new Date(selectedAppDetails.createdAt).toLocaleDateString('he-IL')} בשעה: {new Date(selectedAppDetails.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.tableHeaderGroup}>
                <div style={{ width: '120px' }}></div>
                <h3 className={styles.sectionTitle}>{showHistory ? '🔙 היסטוריית תורים' : '📅 התורים שלי'}</h3>
                <button className={styles.historyToggleBtn} onClick={() => setShowHistory(!showHistory)}>
                    {showHistory ? 'תורים פעילים' : 'תורים שהיו'}
                </button>
            </div>

            <table className={styles.customTable}>
                <thead>
                    <tr>
                        <th>כלב</th>
                        <th>תאריך</th>
                        <th>טווח זמן</th>
                        <th>מחיר</th>
                        <th>הנחה</th>
                        <th>סטטוס</th>
                        {!showHistory && <th>פעולות</th>}
                    </tr>
                </thead>
                <tbody>
                    {currentTableData.map(app => {
                        const status = getStatus(app.appointmentDate, app.dogSize);
                        const isToday = isTodayApp(app.appointmentDate);
                        const canModify = !status.isLocked && !isEditingAnything && !isToday;
                        return (
                            <tr key={app.id} onClick={() => setSelectedAppDetails(app)} className={styles.clickableRow}>
                                <td><strong>{app.dogName}</strong></td>
                                <td>{formatDateFull(app.appointmentDate)}</td>
                                <td><span className={styles.timeBadge}>{formatTime(app.appointmentDate)} - {getEndTime(app.appointmentDate, app.dogSize)}</span></td>
                                <td>{app.price} ₪</td>
                                <td>{calculateDiscount(app) ? <span className={styles.discountBadge}>{calculateDiscount(app)}-</span> : '—'}</td>
                                <td><span className={`${styles.statusBadge} ${status.class}`}>{status.label}</span></td>
                                {!showHistory && (
                                    <td onClick={e => e.stopPropagation()}>
                                        <button disabled={!canModify} onClick={() => onEdit(app)} className={`${styles.actionBtn} ${styles.editBtn} ${!canModify ? styles.disabledBtn : ''}`}>עריכה</button>
                                        <button disabled={!canModify} onClick={() => onDelete(app)} className={`${styles.actionBtn} ${styles.deleteBtn} ${!canModify ? styles.disabledBtn : ''}`}>ביטול</button>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className={styles.divider}></div>
            <h3 className={styles.sectionTitleWithMargin}>📋 לוח תורים כללי</h3>
            <div className={styles.tableControls}>
                <div className={styles.dayNavigator}>
                    <button className={styles.navBtn} onClick={() => onDateChange(-1)}>▶</button>
                    <input type="date" className={styles.dateInputHidden} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                    <button className={styles.navBtn} onClick={() => onDateChange(1)}>◀</button>
                    <button className={styles.todayBtnBrown} onClick={() => { setSelectedDate(getLocalDateString()); setFilterName(''); }}>היום</button>
                </div>
                <input type="text" className={styles.searchBox} placeholder="חפש לפי שם כלב או לקוח..." value={filterName} onChange={(e) => setFilterName(e.target.value)} />
            </div>

            <table className={styles.customTable}>
                <thead>
                    <tr>
                        <th>טווח זמן</th>
                        <th>יום</th>
                        <th>תאריך</th>
                        <th>לקוח</th>
                        <th>כלב</th>
                        <th>סטטוס</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDaily.map(app => (
                        <tr key={app.id} onClick={() => setSelectedAppDetails(app)} className={styles.clickableRow}>
                            <td><span className={styles.timeBadge}>{formatTime(app.appointmentDate)} - {getEndTime(app.appointmentDate, app.dogSize)}</span></td>
                            <td>{formatDayOnly(app.appointmentDate)}</td>
                            <td>{formatDateFull(app.appointmentDate)}</td>
                            <td>{app.userId === user?.id ? (user?.name || 'אני') : (app.firstName || 'לא ידוע')}</td>
                            <td><strong>{app.dogName} ({app.dogSize})</strong></td>
                            <td><span className={`${styles.statusBadge} ${getStatus(app.appointmentDate, app.dogSize).class}`}>{getStatus(app.appointmentDate, app.dogSize).label}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AppointmentTables;