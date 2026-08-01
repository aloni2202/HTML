import { User, getAllUsers, validatePassword, validateAge, validateEmailFormat } from './functions.js';

let citiesDatabase = []; 

const profileImageInput = document.getElementById('profileImage');
const profileImageName = document.getElementById('profileImageName');
const profileImagePreview = document.getElementById('profilePreview');
const cityInput = document.getElementById('city');
const citiesList = document.getElementById('citiesList');
const editForm = document.querySelector('form');
const errorContainer = document.getElementById('registrationError');

let originalUser = null; 
let profileImageBase64 = ''; 
let isModeAdminEditing = false; 
//מציג הודעת שגיאה עם ספריית SweetAlert2
function showError(message) {
    Swal.fire({
        title: 'אופס, משהו לא תקין!',
        text: message,
        icon: 'error',
        confirmButtonText: 'הבנתי, אתקן',
        confirmButtonColor: '#d33',
        backdrop: `rgba(0,0,0,0.4)`
    });
}
// מנקה את הודעת השגיאה
function clearError() {
    if (!errorContainer) return;
    errorContainer.textContent = '';
    errorContainer.classList.add('d-none');
}
// פונקציה לעדכון אפשרויות הערים בהתאם לקלט המשתמש
function updateCityOptions(filterValue) {
    if (!citiesList) return;
    citiesList.innerHTML = '';
    if (!filterValue) return;

    const normalizedFilter = filterValue.toLowerCase();
    const filteredCities = citiesDatabase.filter((cityObj) =>
        cityObj["שם_ישוב"] && cityObj["שם_ישוב"].toLowerCase().includes(normalizedFilter)
    );

    filteredCities.forEach((cityObj) => {
        const option = document.createElement('option');
        option.value = cityObj["שם_ישוב"];
        citiesList.appendChild(option);
    });
}
//פונקציה לקראית הקובץ והמרתו לבייס  64 כדי שנוכל לשמור בדפדפן 
function getSelectedFileBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('שגיאה בקריאת קובץ התמונה'));
        reader.readAsDataURL(file);
    });
}
// פונקציה להצגת תצוגה מקדימה של התמונה שנבחרה
function setProfilePreview(src) {
    if (!profileImagePreview) return;
    profileImagePreview.src = src || '';
}
// פונקציה למילוי הטופס עם נתוני המשתמש המקוריים
function populateForm(user) {
    const fields = {
        userName: user.username || '',
        firstName: user.firstName || '',
        familyName: user.lastName || '',
        emailAddress: user.email || '',
        birthDate: user.dateOfBirth || '',
        city: user.city || '',
        street: user.street || '',
        houseNumber: user.houseNumber || '',
    };

    Object.entries(fields).forEach(([id, value]) => {
        const input = document.getElementById(id);
        if (input) {
            input.value = value;
        }
    });

    setProfilePreview(user.profileImage || '');
    profileImageBase64 = user.profileImage || '';
    
    if (profileImageName) {
        profileImageName.textContent = user.profileImage ? 'תמונה קיימת נטענת' : 'פורמטים נתמכים: JPG, JPEG';
    }

    if (isModeAdminEditing) {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (passwordInput) passwordInput.disabled = true;
        if (confirmPasswordInput) confirmPasswordInput.disabled = true;
    }
}
// פונקציה לטיפול בהגשת הטופס, כולל בדיקות ולידציה ושמירת הנתונים
function handleFormSubmit(event) {
    event.preventDefault();
    clearError();
// קבלת ערכי השדות מהטופס
    const username = document.getElementById('userName')?.value.trim();
    const password = document.getElementById('password')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
    const firstName = document.getElementById('firstName')?.value.trim();
    const lastName = document.getElementById('familyName')?.value.trim();
    const email = document.getElementById('emailAddress')?.value.trim();
    const dateOfBirth = document.getElementById('birthDate')?.value;
    const city = document.getElementById('city')?.value.trim();
    const street = document.getElementById('street')?.value.trim();
    const houseNumberValue = document.getElementById('houseNumber')?.value.trim();
// שימוש בערכים הקיימים במשתמש המקורי אם השדות ריקים
    const finalUsername = username || originalUser.username;
    const finalFirstName = firstName || originalUser.firstName;
    const finalLastName = lastName || originalUser.lastName;
    const finalEmail = email || originalUser.email;
    const finalDateOfBirth = dateOfBirth || originalUser.dateOfBirth;
    const finalCity = city || originalUser.city;
    const finalStreet = street || originalUser.street;
    const finalHouseNumber = houseNumberValue ? Number(houseNumberValue) : originalUser.houseNumber;
    const finalProfileImage = profileImageBase64 || originalUser.profileImage;
//בדיקה שהמשתמש רגיל ולא מנהל , אם כן הוא חייב למלא את כל השדות
    if (!isModeAdminEditing) {
        if (!username || !firstName || !lastName || !email || !dateOfBirth || !city || !street || !houseNumberValue) {
            showError('יש למלא את כל השדות בטופס.');
            return;
        }
    }
// בדיקות ולידציה על השדות שהוזנו
    const usernamePattern = /^[A-Za-z0-9!@#$%^&*()_+={}[\]|\\:;'<>,.?/-]+$/;
    if (finalUsername && !usernamePattern.test(finalUsername)) {
        showError('שם המשתמש אינו חוקי. יש להשתמש באותיות באנגלית, מספרים וסימנים בלבד (ללא עברית).');
        return;
    }

    const streetPattern = /^[א-ת\s]+$/u;
    if (finalStreet && !streetPattern.test(finalStreet)) {
        showError('שם הרחוב שגוי. יש להזין רק אותיות בעברית ורווחים.');
        return;
    }

    if (finalHouseNumber && (!Number.isInteger(finalHouseNumber) || finalHouseNumber <= 0)) {
        showError('מספר הבית אינו תקין. יש להזין מספר חיובי שלם.');
        return;
    }

    if (!isModeAdminEditing && (password || confirmPassword)) {
        if (password !== confirmPassword) {
            showError('הסיסמאות שנקלטו אינן תואמות. אנא ודא ששתי הסיסמאות זהות.');
            return;
        }
        if (!validatePassword(password)) {
            showError('הסיסמה חלשה מדי. עליה להכיל 7-12 תווים, אות גדולה, מספר ותו מיוחד.');
            return;
        }
    }

    if (finalDateOfBirth && !validateAge(finalDateOfBirth)) {
        showError('תאריך הלידה אינו תקין. הגיל במערכת מוגבל בין 1 ל-119.');
        return;
    }

    if (finalEmail && !validateEmailFormat(finalEmail)) {
        showError('כתובת האימייל אינה במבנה תקין. יש להזין אימייל הכולל @ ומסתיים ב- .com');
        return;
    }

    const users = getAllUsers();
    const emailExists = users.some((user) => {
        if (!user || !user.email) return false;
        const isSameUser = originalUser && originalUser.email && user.email.toLowerCase() === originalUser.email.toLowerCase();
        return !isSameUser && user.email.toLowerCase() === finalEmail.toLowerCase();
    });

    if (emailExists) {
        showError('כתובת האימייל שהזנת כבר תפוסה על ידי משתמש אחר במערכת.');
        return;
    }
// יצירת אובייקט משתמש חדש עם הנתונים המעודכנים ושמירתם ב-LocalStorage
    const updatedUser = new User({
        username: finalUsername,
        password: isModeAdminEditing ? originalUser.password : (password || originalUser.password),
        firstName: finalFirstName,
        lastName: finalLastName,
        email: finalEmail,
        dateOfBirth: finalDateOfBirth,
        city: finalCity,
        street: finalStreet,
        houseNumber: finalHouseNumber,
        profileImage: finalProfileImage,
        role: originalUser.role || 'user' // שומר על התפקיד המקורי שלו (למשל אם הוא עצמו אדמין)
    });

    const userIndex = users.findIndex((user) => originalUser && user.email && user.email.toLowerCase() === originalUser.email.toLowerCase());
    if (userIndex >= 0) {
        users[userIndex] = updatedUser;
    } else {
        users.push(updatedUser);
    }

    localStorage.setItem('users', JSON.stringify(users));

    if (!isModeAdminEditing) {
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }

    localStorage.removeItem('editUserTarget');

    Swal.fire({
        title: 'הפרטים נשמרו בהצלחה!',
        text: isModeAdminEditing ? 'נתוני המשתמש עודכנו על ידי מנהל.' : 'הפרופיל שלך עודכן במערכת.',
        icon: 'success',
        confirmButtonText: 'אישור',
        confirmButtonColor: '#3085d6',
        backdrop: `rgba(0,0,0,0.4)`
    }).then((result) => {
        if (result.isConfirmed) {
            // ניתוח לאן להחזיר את המשתמש
            window.location.href = isModeAdminEditing ? 'adminPage.html' : 'profile.html';
        }
    });
}
// פונקציה לאתחול הדף, כולל טעינת רשימת הערים, בדיקת משתמש מחובר ומילוי הטופס
async function init() {
    try {
        const response = await fetch('./cities.json');
        citiesDatabase = await response.json();
    } catch (error) {
        console.error("שגיאה בטעינת רשימת הערים:", error);
    }

    const loggedInUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!loggedInUser) {
        window.location.href = 'loginPage.html';
        return;
    }

    const adminTargetUsername = localStorage.getItem('editUserTarget');
    
    if (adminTargetUsername && loggedInUser.role === 'admin') {
        isModeAdminEditing = true;
        const allUsers = getAllUsers();
        originalUser = allUsers.find(u => u.username === adminTargetUsername);
        
        if (!originalUser) {
            showError('המשתמש המבוקש לא נמצא במערכת.');
            window.location.href = 'adminPage.html';
            return;
        }
    } else {
        originalUser = loggedInUser;
    }

    populateForm(originalUser);
// הוספת מאזינים לאירועים של שינוי תמונת פרופיל ושינוי קלט העיר    
    if (profileImageInput) {
        profileImageInput.addEventListener('change', async () => {
            const file = profileImageInput.files[0];
            const defaultLabel = 'פורמטים נתמכים: JPG, JPEG';
// אם המשתמש לא בחר קובץ, נטען את התמונה המקורית או נשאיר ריקה
            if (!file) {
                if (profileImageName) {
                    profileImageName.textContent = originalUser.profileImage ? 'תמונה קיימת נטענת' : defaultLabel;
                }
                profileImageBase64 = originalUser.profileImage || '';
                setProfilePreview(originalUser.profileImage || '');
                return;
            }

            const fileName = file.name;
            const isValidExtension = /\.(jpe?g)$/i.test(fileName);
// אם סוג הקובץ אינו נתמך, נציג הודעת שגיאה ונחזיר את השדות למצב המקורי
            if (!isValidExtension) {
                if (profileImageName) {
                    profileImageName.textContent = defaultLabel;
                }
                profileImageInput.value = '';
                profileImageBase64 = originalUser.profileImage || '';
                showError('סוג הקובץ אינו נתמך. יש לבחור קובץ JPG או JPEG בלבד.');
                return;
            }

            if (profileImageName) {
                profileImageName.textContent = `נבחר: ${fileName}`;
            }

            clearError();
// נסיון לקרוא את הקובץ ולהמירו לבסיס 64, ואם יש שגיאה נציג הודעה ונחזיר את השדות למצב המקורי
            try {
                profileImageBase64 = await getSelectedFileBase64(file);
                setProfilePreview(profileImageBase64);
            } catch (error) {
                if (profileImageName) {
                    profileImageName.textContent = defaultLabel;
                }
                profileImageInput.value = '';
                profileImageBase64 = originalUser.profileImage || '';
                showError('אירעה שגיאה בקריאת קובץ התמונה שבחרת.');
            }
        });
    }
// מאזין לאירוע שינוי קלט העיר כדי לעדכן את רשימת הערים המוצעת בהתאם למה שהמשתמש מקליד
    if (cityInput) {
        cityInput.addEventListener('input', () => {
            updateCityOptions(cityInput.value.trim());
        });
    }

    if (editForm) {
        editForm.addEventListener('submit', handleFormSubmit);
    }
}

document.addEventListener('DOMContentLoaded', init);