import React, { useState } from "react";
import styles from "./AppointmentTables.module.css";

const AppointmentTables = ({
    myAppointments,
    allAppointments,
    selectedDate,
    onDateChange,
    onEdit,
    onDelete,
    setSelectedDate,
    isEditingAnything,
    user,
}) => {
    const [filterName, setFilterName] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [selectedAppDetails, setSelectedAppDetails] = useState(null);
    const [showAdminModal, setShowAdminModal] = useState(false);

    const displayName = user?.firstName || user?.username || "אני";
    const currentUserId = user?.userId;

    const isAdmin =
        user?.role === "admin" ||
        user?.isAdmin === true ||
        user?.role === "ADMIN" ||
        user?.type === "admin" ||
        String(user?.role).toLowerCase() === "admin";

    const handleAdminInfo = (e) => {
        e.stopPropagation();
        setShowAdminModal(true);
    };

    const getLocalDateString = (date = new Date()) => date.toLocaleDateString("en-CA");
    const isTodayApp = (dateStr) => dateStr?.split("T")[0] === getLocalDateString();

    const getDurationMinutes = (size) => {
        switch (size) {
            case "גדול": return 90;
            case "בינוני": return 60;
            case "קטן": return 30;
            default: return 30;
        }
    };

    const getEndTime = (app) => {
        if (app?.endTime) return new Date(app.endTime).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
        const start = new Date(app.appointmentDate);
        const duration = getDurationMinutes(app.dogSize);
        const end = new Date(start.getTime() + duration * 60000);
        return end.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    };

    const calculateDiscount = (app) => {
        if (app.discount && app.discount > 0) return `${app.discount}%`;
        const basePrices = { קטן: 100, בינוני: 150, גדול: 200 };
        const basePrice = basePrices[app.dogSize] || 0;
        if (app.price < basePrice && basePrice > 0) {
            return `${Math.round(((basePrice - app.price) / basePrice) * 100)}%`;
        }
        return null;
    };

    const formatTime = (d) => new Date(d).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    const formatDateFull = (dateStr) => new Date(dateStr).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, ".");
    const formatDayOnly = (dateStr) => new Date(dateStr).toLocaleDateString("he-IL", { weekday: "long" });

    const getStatus = (appointmentDate, dogSize) => {
        const appTime = new Date(appointmentDate);
        const now = new Date();
        const duration = getDurationMinutes(dogSize);
        const diffInMinutes = (now - appTime) / (1000 * 60);
        const isToday = getLocalDateString(now) === appointmentDate?.split("T")[0];
        if (!isToday) return now > appTime ? { label: "הסתיים", class: styles.statusPast, isLocked: true } : { label: "ממתין", class: styles.statusFuture, isLocked: false };
        if (diffInMinutes >= duration) return { label: "הסתיים", class: styles.statusPast, isLocked: true };
        if (diffInMinutes >= 0 && diffInMinutes < duration) return { label: "בטיפול ✂️", class: styles.statusNow, isLocked: true };
        return { label: "ממתין", class: styles.statusFuture, isLocked: false };
    };

    const activeMyAppointments = myAppointments.filter((app) => getStatus(app.appointmentDate, app.dogSize).label !== "הסתיים");
    const historyMyAppointments = myAppointments.filter((app) => getStatus(app.appointmentDate, app.dogSize).label === "הסתיים");
    const currentTableData = showHistory ? historyMyAppointments : activeMyAppointments;

    const filteredDaily = allAppointments.filter((app) => {
        const matchesName = app.dogName?.toLowerCase().includes(filterName.toLowerCase()) || app.customerName?.toLowerCase().includes(filterName.toLowerCase());
        return filterName.trim() !== "" ? matchesName : app.appointmentDate?.startsWith(selectedDate);
    });

    const isMine = (app) => currentUserId != null && app?.userId === currentUserId;

    return (
        <div className={styles.tableCard}>
            {showAdminModal && (
                <div className={styles.modalOverlay} style={{ zIndex: 11000 }} onClick={() => setShowAdminModal(false)}>
                    <div className={styles.infoModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.infoIcon}>🛡️</div>
                        <h3 className={styles.modalTitle}>חשבון מנהל</h3>
                        <p className={styles.infoText}>
                            הנך מחובר עם הרשאות מנהל.
                            <br /><br />
                            בסטטוס זה, יש לך אפשרות לצפות במחירים, הנחות ופרטי תשלום של <strong>כלל הלקוחות</strong> במערכת.
                        </p>
                        <button className={styles.todayBtnBrown} onClick={() => setShowAdminModal(false)}>סגור</button>
                    </div>
                </div>
            )}

            {isAdmin && (
                <div className={styles.adminGlobalBadge} onClick={handleAdminInfo}>
                    ⚡ מחובר כחשבון מנהל (לחץ למידע נוסף)
                </div>
            )}

            {selectedAppDetails && (
                <div className={styles.modalOverlay} onClick={() => setSelectedAppDetails(null)}>
                    <div className={styles.detailsModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>כרטיס תור: {selectedAppDetails.dogName} 🐾</h3>
                            <span className={styles.closeBtn} onClick={() => setSelectedAppDetails(null)}>&times;</span>
                        </div>
                        <div className={styles.modalContent}>
                            {isAdmin && (
                                <div className={styles.adminPopupLabelContainer}>
                                    <span className={styles.adminPopupLabelStatic}>מנהל מערכת 🛠️</span>
                                </div>
                            )}

                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>לקוח:</span>
                                <span className={styles.detailValue}>{isMine(selectedAppDetails) ? displayName : (selectedAppDetails.customerName || "לא ידוע")}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>סוג כלב:</span>
                                <span className={styles.detailValue}>{selectedAppDetails.dogSize}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>זמן טיפול:</span>
                                <span className={styles.detailValue}>{formatTime(selectedAppDetails.appointmentDate)} - {getEndTime(selectedAppDetails)}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>תאריך:</span>
                                <span className={styles.detailValue}>{formatDateFull(selectedAppDetails.appointmentDate)}</span>
                            </div>

                            {(isMine(selectedAppDetails) || isAdmin) ? (
                                <>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>הנחה:</span>
                                        <span className={styles.detailValue}>
                                            {calculateDiscount(selectedAppDetails) ? <span className={styles.discountBadge}>-{calculateDiscount(selectedAppDetails)}</span> : "ללא הנחה"}
                                        </span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>מחיר:</span>
                                        <span className={styles.detailValuePrice}>{selectedAppDetails.price} ₪</span>
                                    </div>
                                </>
                            ) : (
                                <div className={styles.privacyNote}>פרטי תשלום חסויים 🔒</div>
                            )}
                            <div className={styles.creationFooter}>
                                תור זה נוצר בתאריך: {new Date(selectedAppDetails.createdAt).toLocaleDateString("he-IL")} בשעה: {new Date(selectedAppDetails.createdAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.tableHeaderGroup}>
                <div style={{ width: "120px" }}></div>
                <h3 className={styles.sectionTitle}>{showHistory ? "🔙 היסטוריית תורים" : "📅 התורים שלי"}</h3>
                <button className={styles.historyToggleBtn} onClick={() => setShowHistory(!showHistory)}>
                    {showHistory ? "תורים פעילים" : "תורים שהיו"}
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
                    {currentTableData.map((app) => {
                        const isLocked = getStatus(app.appointmentDate, app.dogSize).isLocked;
                        const isToday = isTodayApp(app.appointmentDate);

                        const isControlDisabled = isEditingAnything;

                        return (
                            <tr key={app.id} onClick={() => setSelectedAppDetails(app)} className={styles.clickableRow}>
                                <td><strong>{app.dogName}</strong></td>
                                <td>{formatDateFull(app.appointmentDate)}</td>
                                <td><span className={styles.timeBadge}>{formatTime(app.appointmentDate)} - {getEndTime(app)}</span></td>
                                <td>{app.price} ₪</td>
                                <td>{calculateDiscount(app) ? <span className={styles.discountBadge}>-{calculateDiscount(app)}</span> : "—"}</td>
                                <td><span className={`${styles.statusBadge} ${getStatus(app.appointmentDate, app.dogSize).class}`}>{getStatus(app.appointmentDate, app.dogSize).label}</span></td>
                                {!showHistory && (
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <button
                                            disabled={isControlDisabled}
                                            onClick={() => onEdit(app)}
                                            className={`${styles.actionBtn} ${styles.editBtn}`}
                                        >
                                            עריכה
                                        </button>
                                        <button
                                            disabled={isControlDisabled}
                                            onClick={() => onDelete(app)}
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                        >
                                            ביטול
                                        </button>
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
                    <button className={styles.todayBtnBrown} onClick={() => { setSelectedDate(getLocalDateString()); setFilterName(""); }}>היום</button>
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
                    {filteredDaily.map((app) => (
                        <tr key={app.id} onClick={() => setSelectedAppDetails(app)} className={styles.clickableRow}>
                            <td><span className={styles.timeBadge}>{formatTime(app.appointmentDate)} - {getEndTime(app)}</span></td>
                            <td>{formatDayOnly(app.appointmentDate)}</td>
                            <td>{formatDateFull(app.appointmentDate)}</td>
                            <td>{isMine(app) ? displayName : (app.customerName || "לא ידוע")}</td>
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