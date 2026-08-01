import { 
    getAllUsers, 
    showError, 
    clearError, 
    ensureAdminExists, 
    authenticateUser 
} from './functions.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return; 

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('errorMsg');

// בדיקה כללית שהמנהל קיים במערכת 
    ensureAdminExists();

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        clearError(errorMsg);

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
//בדיקת שדות ריקים 
        if (!username || !password) {
            showError(errorMsg, 'נא למלא את כל השדות (שם משתמש וסיסמה הם חובה).');
            return;
        }

        const usernameRegex = /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/; // בדיקה שהשם משתמש מכיל אותיות לועזיות, מספרים או תווים מיוחדים בלבד
        if (!usernameRegex.test(username)) {
            showError(errorMsg, 'שם המשתמש חייב להכיל אותיות לועזיות (באנגלית), מספרים או תווים מיוחדים בלבד.');
            return;
        }
// בדיקה אם המשתמש מנהל, מעביר אותו לעמוד המנהל 
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
//אימות משתמש רגיל מול המאגר, שמירת הסשן והפניה לעמוד הפרופיל 
        const foundUser = authenticateUser(username, password);

        if (!foundUser) {
            showError(errorMsg, 'שם משתמש או סיסמה שגויים או שאינם קיימים במאגר.');
            return;
        }

        sessionStorage.setItem('currentUser', JSON.stringify(foundUser));
        window.location.href = 'profile.html';
    });
});