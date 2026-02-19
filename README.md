# 🐾 DogStyle - Dog Grooming Salon System

מערכת מלאה לניהול תורים למספרת כלבים בוטיק, המשלבת Backend ב-.NET ו-Frontend ב-React.

## 🚀 דגשים טכניים ומימוש דרישות
* **SQL Procedures:** שימוש בפרוצדורה `GetUserAppointmentCount` לניהול לוגיקת הנחות בשרת.
* **SQL View:** יצירת `vw_FullAppointmentDetails` המאפשרת שליפת נתונים מורכבת ויעילה.
* **Business Logic:** חישוב זמנים ומחירים אוטומטי (30/60/90 דקות) והנחה של 10% החל מהתור הרביעי.
* **Security & UX:** חסימת ביטול תורים באותו היום, הצפנת סיסמאות, ותמיכה מלאה במקש Enter בטפסים.

## 💾 הקמת בסיס הנתונים
כדי להקים את הסביבה, יש להריץ את הסקריפט המצורף ב-Repository בשם: `init_db.sql`.

## 🛠 הרצה מקומית
1. יש לעדכן את ה-Connection String בקובץ `appsettings.json` בשרת.
2. הרצת ה-API (תיקיית DogSalon.API).
3. הרצת ה-Client (תיקיית DogSalon.Client) באמצעות `npm install` ולאחר מכן `npm run dev`.
