// --- לוגיקת דף תפריט התחברות (Login Page) המעודכנת ---
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return; 

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('errorMsg');

    // יצירת משתמש אדמין סטטי בתוך המאגר המשותף של אלון (users) במידה והוא לא קיים
    let currentUsersList = JSON.parse(localStorage.getItem('users')) || [];
    const adminExists = currentUsersList.some(user => user.username === 'admin');
    
    if (!adminExists) {
        currentUsersList.push({
            username: 'admin',
            password: 'admin1234admin', // הסיסמה המקורית של המרצה!
            firstName: 'מנהל',
            lastName: 'המערכת',
            role: 'admin'
        });
        localStorage.setItem('users', JSON.stringify(currentUsersList));
    }

    // טיפול בשליחת טופס ההתחברות + ולידציות
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); 
        errorMsg.textContent = ''; 

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // 1. בדיקה ששני השדות מלאים (שדות חובה)
        if (!username || !password) {
            errorMsg.textContent = 'נא למלא את כל השדות (שם משתמש וסיסמה הם חובה).';
            return;
        }

        // --- החרגת אדמין מהוולידציות של חוזק הסיסמה ---
        if (username !== 'admin') {
            
            // ולידציה לשם משתמש רגיל
            const usernameRegex = /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
            if (!usernameRegex.test(username)) {
                errorMsg.textContent = 'שם המשתמש חייב להכיל אותיות לועזיות, מספרים או תווים מיוחדים בלבד.';
                return;
            }
            if (username.length > 60) {
                errorMsg.textContent = 'שם המשתמש לא יכול לעלות על 60 תווים.';
                return;
            }

            // ולידציה לסיסמה רגילה
            if (password.length < 7 || password.length > 12) {
                errorMsg.textContent = 'הסיסמה חייבת להיות באורך של בין 7 ל-12 תווים.';
                return;
            }

            const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
            const hasUpper = /[A-Z]/.test(password);
            const hasNumber = /[0-9]/.test(password);

            if (!hasSpecial || !hasUpper || !hasNumber) {
                errorMsg.textContent = 'הסיסמה חייבת להכיל לפחות אות גדולה אחת (A-Z), מספר אחד (0-9) ותו מיוחד אחד.';
                return;
            }
        }

        // בדיקה במאגר הנתונים של אלון
        let dbUsers = JSON.parse(localStorage.getItem('users')) || [];
        const foundUser = dbUsers.find(user => user.username === username && user.password === password);

        if (!foundUser) {
            errorMsg.textContent = 'שם משתמש או סיסמה שגויים או שאינם קיימים במאגר.';
            return;
        }

        // שמירת המשתמש ב-Session Storage וניתוב
        sessionStorage.setItem('currentUser', JSON.stringify(foundUser));

        if (foundUser.role === 'admin') {
            window.location.href = 'adminPage.html';
        } else {
            window.location.href = 'profile.html';
        }
    });
});

// --- מנגנון הגנה על דף הפרופיל האישי ---
document.addEventListener('DOMContentLoaded', function() {
    const profilePageElement = document.getElementById('profilePage');
    if (!profilePageElement) return; 

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert('גישה חסומה! עליך להתחבר למערכת תחילה.');
        window.location.href = 'index.html';
        return;
    }
    
    if (currentUser.role === 'admin') {
        window.location.href = 'adminPage.html';
        return;
    }
});