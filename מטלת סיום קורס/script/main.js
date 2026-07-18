import { getAllUsers, showError, clearError } from './functions.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    // אם אנחנו לא בדף ההתחברות, הפונקציה תעצור כאן ולא תזרוק שגיאות בדפים אחרים
    if (!loginForm) return; 

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('errorMsg');

    // יצירת משתמש אדמין סטטי בתוך המאגר במידה והוא לא קיים
    let currentUsersList = JSON.parse(localStorage.getItem('users')) || [];
    const adminExists = currentUsersList.some(user => user.username === 'admin');
    
    if (!adminExists) {
        currentUsersList.push({
            username: 'admin',
            password: 'admin1234admin', // הסיסמה המקורית של המרצה
            firstName: 'מנהל',
            lastName: 'מערכת',
            role: 'admin'
        });
        localStorage.setItem('users', JSON.stringify(currentUsersList));
    }

    // טיפול בשליחת טופס ההתחברות וולידציות
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        clearError(errorMsg);

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // 1. בדיקה ששני השדות מלאים (שדות חובה)
        if (!username || !password) {
            showError(errorMsg, 'נא למלא את כל השדות (שם משתמש וסיסמה הם חובה).');
            return;
        }

        const users = getAllUsers();

        // 2. בדיקת התחברות מנהל מערכת (Admin)
        if (username === 'admin' && password === 'admin1234admin') {
            sessionStorage.setItem('currentUser', JSON.stringify({
                username: 'admin',
                role: 'admin',
                firstName: 'מנהל',
                lastName: 'מערכת'
            }));
            window.location.href = 'adminPage.html';
            return;
        }

        // 3. חיפוש משתמש רגיל במאגר הנתונים
        const foundUser = users.find((user) => user.username === username && user.password === password);

        // אם המשתמש לא נמצא
        if (!foundUser) {
            showError(errorMsg, 'שם משתמש או סיסמה שגויים או שאינם קיימים במאגר.');
            return;
        }

        // 4. התחברות מוצלחת! שמירה ב-Session ומעבר לפרופיל
        sessionStorage.setItem('currentUser', JSON.stringify(foundUser));
        window.location.href = 'profile.html';
    });
});