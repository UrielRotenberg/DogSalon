# 🐾 DogStyle | מערכת ניהול תורים חכמה למספרות כלבים

מערכת Full-Stack מתקדמת לניהול תורים, המבוססת על **.NET 10 Web API** ו-**React**. הפרויקט מדגים שימוש בארכיטקטורת שכבות, ניהול נתונים מאובטח וחווית משתמש חלקה.

## 🛠 טכנולוגיות וארכיטקטורה

### **Backend (.NET 10)**
* **Layered Architecture:** הפרדה מוחלטת בין Controllers, Services, ו-Repositories לשמירה על קוד נקי וקל לתחזוקה.
* **Security:** אימות מבוסס JWT עם ניהול הרשאות מבוסס תפקידים (RBAC).
* **Global Exception Handling:** שימוש ב-Middleware לטיפול בשגיאות בצורה אחידה (Problem Details).
* **Concurrency Management:** ולידציה בשרת למניעת חפיפת תורים ושמירה על שלמות הנתונים.

### **Database (SQL Server)**
* **Advanced Logic:** מימוש לוגיקה עסקית (תמחור, זמנים והנחות) דרך **Stored Procedures** לשיפור ביצועים.
* **Data Abstraction:** שימוש ב-**SQL View** אופטימלי (`vw_FullAppointmentDetails`) לחישובים דינמיים כמו זמן סיום (`EndTime`).
* **Optimization:** שימוש אסטרטגי ב-**Indexes** על עמודות קריטיות (`AppointmentDate`, `UserId`) לביצועי שליפה מהירים.

### **Frontend (React)**
* **State Management:** שימוש ב-React Hooks ו-Context API לניהול מצב התחברות גלובלי.
* **UX Excellence:** משוב בזמן אמת באמצעות **Toast Notifications** וממשק Dashboard הכולל טבלאות נפרדות לתורים אישיים ולוח כללי.
* **Admin Capabilities:** גישה מורחבת למנהלים לצפייה בנתונים פיננסיים רגישים וניהול הלוח הכללי.

---

## 🚀 לוגיקה עסקית ופיצ'רים
* **תמחור אוטומטי:** חישוב דינמי לפי גודל הכלב (קטן: 30 דקות, בינוני: 60 דקות, גדול: 90 דקות).
* **תכנית נאמנות:** מתן **10% הנחה** אוטומטית החל מהתור הרביעי של הלקוח.
* **אכיפת מדיניות:** חסימת אפשרות לביטול או עריכת תור ביום האירוע לשמירה על הכנסות המספרה.

---

## 💻 התקנה והרצה

### **1. הגדרת בסיס הנתונים**
1. פתח את ה-**SQL Server Management Studio (SSMS)**.
2. הרץ את הסקריפט `Database/init_db.sql` ליצירת הטבלאות, המבטים והפרוצדורות.
3. *(אופציונלי)* עדכן משתמש בטבלת ה-Users ל-`IsAdmin = 1` כדי לקבל הרשאות מנהל.

### **2. הגדרת ה-Backend**
1. נווט לקובץ `DogSalon.API/appsettings.json`.
2. עדכן את ה-`ConnectionStrings` בהתאם לשרת ה-SQL המקומי שלך.
3. הרץ את הפרויקט דרך Visual Studio או באמצעות הפקודה `dotnet run`.

### **3. הרצת ה-Frontend**
```bash
cd DogSalon.Client
npm install
npm run dev
