document.addEventListener("DOMContentLoaded", () => {
    // 1. שליפת המשתמש המחובר מה-Session Storage
    const sessionData = sessionStorage.getItem("currentUser");

    // הגנת הדף: אם הזיכרון ריק, הפניה מיידית לדף התחברות כפי שביקש המרצה
    if (!sessionData) {
        alert("גישה חסומה! אנא התחבר קודם.");
        window.location.href = "index.html"; // תוקן ל-index.html
        return;
    }

    const currentUser = JSON.parse(sessionData);

    // 2. הזנת הנתונים לתוך אלמנטי ה-HTML בדף
    document.getElementById("displayFullName").textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById("displayUsername").textContent = `@${currentUser.username}`;
    document.getElementById("displayEmail").textContent = currentUser.email;
    document.getElementById("displayCity").textContent = currentUser.city;
    document.getElementById("displayAddress").textContent = `רחוב ${currentUser.street} ${currentUser.houseNumber}`;
    
    // פורמט תאריך קריא
    const date = new Date(currentUser.dateOfBirth);
    document.getElementById("displayBirthDate").textContent = date.toLocaleDateString('he-IL');

    // הצגת תמונת הפרופיל (Base64 שהמרנו בהרשמה)
    if (currentUser.profileImage) {
        document.getElementById("displayImage").src = currentUser.profileImage;
    } else {
        // תמונת ברירת מחדל אם אין
        document.getElementById("displayImage").src = "https://via.placeholder.com/150";
    }

    // 3. כפתור התנתק - מנקה את ה-Session Storage ומחזיר ללוגין
    document.getElementById("logoutBtn").addEventListener("click", () => {
        sessionStorage.removeItem("currentUser");
        window.location.href = "index.html"; // תוקן ל-index.html (הורדתי את ה-alert המציק, המעבר המיידי עדיף חווייתית)
    });
});