//הצגת הודעת שגיאה על המסך מתחת לשדה הרלוונטי 
export function showError(errorElement, message) {
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}
//מחיקת הודעת השגיאה מהמסך
export function clearError(errorElement) {
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}
// תבנית ליצירת אובייקטים של משתמשים בעמרכת 
// הבנאי מקבל אובייקט עם כל המאפיינים של המשתמש ומגדיר אותם כמאפיינים של האובייקט החדש
export class User {
    constructor({ username, password, firstName, lastName, email, dateOfBirth, city, street, houseNumber, profileImage }) {
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.dateOfBirth = dateOfBirth;
        this.city = city;
        this.street = street;
        this.houseNumber = houseNumber;
        this.profileImage = profileImage;
    }
}
// שליפת רשימת כל המשתמשים מהלוקל סטורג' והחזרתם כמערך של אובייקטים
export function getAllUsers() {
    try {
        const usersData = localStorage.getItem('users');
        return usersData ? JSON.parse(usersData) : [];
    } catch (e) {
        console.error("שגיאה בקריאת המשתמשים מ-LocalStorage", e);
        return [];
    }
}
//בדיקה שהסיסמא עומדת בתנאים
export function validatePassword(password) {
    if (password.length < 7 || password.length > 12) return false;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUpperCase && hasNumber && hasSpecialChar;
}
// בדיקת תנאי לגיל 
export function validateAge(dateOfBirthString) {
    if (!dateOfBirthString) return false;
    const birthDate = new Date(dateOfBirthString);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age >= 0 && age <= 120;
}
// בדיקת תקינות כתובת מייל
export function validateEmailFormat(email) {
    if (!email.toLowerCase().endsWith('.com')) return false;
    
    const atCount = (email.match(/@/g) || []).length;
    if (atCount !== 1) return false;
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

// בדיקה אם המשתמש הנוכחי הוא מנהל
export function checkAdminPermission() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    return currentUser && currentUser.role === 'admin';
}

// מחזירה מערך של המשתמשים "הרגילים" מתוך המערכת ללא המנהל עצמו
export function getRegularUsers() {
    const allUsers = JSON.parse(localStorage.getItem('users')) || [];
    return allUsers.filter(user => user.username !== 'admin' && user.role !== 'admin');
}

// הצגת הפרטים של האובייקט בצורה קריאה למשתמש (שם+שם משפחה=שם מלא)
export function formatUserData(user) {
    return {
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'לא הוזן',
        fullAddress: `${user.street || ''} ${user.houseNumber || ''}, ${user.city || ''}`.trim() || 'לא הוזן',
        birthDateDisplay: user.dateOfBirth || 'לא הוזן'
    };
}

// מחיקת משתמש מהאחסון המקומי לפי שם המשתמש שלו
export function deleteUserByUsername(usernameToDelete) {
    const allUsers = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = allUsers.filter(user => user.username !== usernameToDelete);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
}

// ניווט לדף עריכת פרופיל עם שמירת שם המשתמש בלוקל סטורג
export function navigateToEditProfile(username) {
    localStorage.setItem('editUserTarget', username);
    window.location.href = 'edit-profile.html';
}

// מוודא שתמיד יהיה קיים משתמש מנהל דיפולטיבי במערכת
export function ensureAdminExists() {
    let currentUsersList = getAllUsers();
    const adminExists = currentUsersList.some(user => user.username === 'admin');
    
    if (!adminExists) {
        currentUsersList.push({
            username: 'admin',
            password: 'admin1234admin', 
            firstName: 'מנהל',
            lastName: 'מערכת',
            role: 'admin'
        });
        localStorage.setItem('users', JSON.stringify(currentUsersList));
    }
}
//אימות פרטי התחברות של המשתמש 
export function authenticateUser(username, password) {
    const users = getAllUsers();
    return users.find(user => user.username === username && user.password === password) || null;
}