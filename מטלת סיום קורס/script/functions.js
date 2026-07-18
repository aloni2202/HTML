// פונקציות עזר להצגה והסתרה של שגיאות במסכים
export function showError(errorElement, message) {
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

export function clearError(errorElement) {
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

// הגדרת מבנה אובייקט המשתמש במערכת (User Class)
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

// שליפת כל המשתמשים מ-Local Storage בצורה בטוחה
export function getAllUsers() {
    try {
        const usersData = localStorage.getItem('users');
        return usersData ? JSON.parse(usersData) : [];
    } catch (e) {
        console.error("שגיאה בקריאת המשתמשים מ-LocalStorage", e);
        return [];
    }
}

// ולידציית מורכבות סיסמה: 7-12 תווים, אות גדולה, מספר ותו מיוחד
export function validatePassword(password) {
    if (password.length < 7 || password.length > 12) return false;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUpperCase && hasNumber && hasSpecialChar;
}

// ולידציית גיל תקין: חישוב מול תאריך נוכחי (גיל בין 0 ל-120)
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

// ולידציית פורמט מייל: @ אחד בלבד וסיומת .com בלבד
export function validateEmailFormat(email) {
    // בודק שהמייל מסתיים ב-.com באותיות קטנות בלבד
    if (!email.toLowerCase().endsWith('.com')) return false;
    
    // סופר כמה פעמים מופיע התו @
    const atCount = (email.match(/@/g) || []).length;
    if (atCount !== 1) return false;
    
    // בדיקת תווים בסיסית באנגלית
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}