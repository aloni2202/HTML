import { User, getAllUsers, validatePassword, validateAge, validateEmailFormat } from './functions.js';
//רשימת הערים תישמר במשתנה זה לאחר טעינת הקובץ JSON
let citiesDatabase = [];
//htmlתפיסת האלמנטים המרכזיים של טופס ה 
const registrationForm = document.querySelector('form');
const profileImageInput = document.getElementById('profileImage');
const profileImageName = document.getElementById('profileImageName');
const errorContainer = document.getElementById('registrationError');
const cityInput = document.getElementById('city');
const citiesList = document.getElementById('citiesList');

let profileImageBase64 = '';
// פונקציה שמציגה הודעת שגיאה למשתמש באמצעות ספריית SweetAlert2
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
// פונקציה שמעדכנת את רשימת הערים המוצעת בהתאם למה שהמשתמש מקליד
function updateCityOptions(filterValue) {
    if (!citiesList) return;
    citiesList.innerHTML = '';
    if (!filterValue) return;

    const normalizedFilter = filterValue.toLowerCase();

    const filteredCities = citiesDatabase.filter((cityObj) =>
        cityObj["שם_ישוב"] && cityObj["שם_ישוב"].toLowerCase().includes(normalizedFilter)
    );

    filteredCities.sort((a, b) => {
        const aName = a["שם_ישוב"];
        const bName = b["שם_ישוב"];
        const aStartsWith = aName.startsWith(filterValue);
        const bStartsWith = bName.startsWith(filterValue);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return aName.localeCompare(bName);
    });

    filteredCities.forEach((cityObj) => {
        const option = document.createElement('option');
        option.value = cityObj["שם_ישוב"];
        citiesList.appendChild(option);
    });
}

if (cityInput) {
    cityInput.addEventListener('input', () => {
        updateCityOptions(cityInput.value.trim());
    });
}
// פונקציה שמקבלת קובץ תמונה ומחזירה את התוכן שלו כבסיס 64
function getSelectedFileBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('שגיאה בקריאת קובץ התמונה'));
        reader.readAsDataURL(file);
    });
}

if (profileImageInput) {
    profileImageInput.addEventListener('change', async () => {
        const file = profileImageInput.files[0];
        if (!file) return;

        const isValidExtension = /\.(jpe?g)$/i.test(file.name);
        if (!isValidExtension) {
            profileImageInput.value = '';
            showError('בחר קובץ JPG או JPEG בלבד.');
            return;
        }

        profileImageName.textContent = `נבחר: ${file.name}`;
        try {
            profileImageBase64 = await getSelectedFileBase64(file);
        } catch (error) {
            showError('לא ניתן לקרוא את קובץ התמונה.');
        }
    });
}
//תופס את אירוע השליחה של הטופס ועוצר את רענון העמוד הברירת-מחדלי של הדפדפן 
if (registrationForm) {
    registrationForm.addEventListener('submit', (event) => {
        event.preventDefault();
//שליפת כל השדות מהטופס וניקוי רווחים מיותרים עם טרים
        const username = document.getElementById('userName')?.value.trim();
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        const firstName = document.getElementById('firstName')?.value.trim();
        const lastName = document.getElementById('familyName')?.value.trim();
        const email = document.getElementById('emailAddress')?.value.trim();
        const dateOfBirth = document.getElementById('birthDate')?.value;
        const city = document.getElementById('city')?.value.trim();
        const street = document.getElementById('street')?.value.trim();
        const houseNumberValue = document.getElementById('houseNumber')?.value.trim();
// בדיקה אם כל השדות מולאו, ואם לא, מציג הודעת שגיאה ומפסיק את ההרשמה
        if (!username || !password || !confirmPassword || !firstName || !lastName || !email || !dateOfBirth || !city || !street || !houseNumberValue) {
            showError('יש למלא את כל השדות בטופס.');
            return;
        }
//בדיקות ולידציה 
        const usernameRegex = /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
        if (!usernameRegex.test(username)) {
            showError('שם המשתמש אינו חוקי. יש להשתמש באותיות באנגלית, מספרים וסימנים בלבד (ללא עברית).');
            return;
        }

        if (!/^[א-ת\s]+$/u.test(street)) {
            showError('שם הרחוב שגוי. יש להזין רק אותיות בעברית ורווחים.');
            return;
        }

        const houseNumber = Number(houseNumberValue);
        if (!Number.isInteger(houseNumber) || houseNumber <= 0) {
            showError('מספר הבית אינו תקין. יש להזין מספר חיובי שלם.');
            return;
        }
//בדיקת ולידציות מיובאות מהקובץ של הפונקצית
        if (password !== confirmPassword) {
            showError('הסיסמאות שנקלטו אינן תואמות. אנא ודא ששתי הסיסמאות זהות.');
            return;
        }

        if (!validatePassword(password)) {
            showError('הסיסמה חלשה מדי. עליה להכיל 7-12 תווים, אות גדולה, מספר ותו מיוחד.');
            return;
        }

        if (!validateAge(dateOfBirth)) {
            showError('תאריך הלידה אינו תקין. הגיל במערכת מוגבל בין 1 ל-119.');
            return;
        }

        if (!validateEmailFormat(email)) {
            showError('כתובת האימייל אינה במבנה תקין. יש להזין אימייל הכולל @ ומסתיים ב- .com');
            return;
        }

        const users = getAllUsers();
        const emailExists = users.some((user) => user && user.email && user.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
            showError('כתובת האימייל שהזנת כבר קיימת במערכת בשימוש של משתמש אחר.');
            return;
        }

        if (!profileImageBase64) {
            showError('אנא העלה תמונת פרופיל בפורמט JPG או JPEG כדי להשלים את ההרשמה.');
            return;
        }
        // יצירת אובייקט משתמש חדש ושמירתו במשתנה users, ולאחר מכן שמירת הרשימה המעודכנת ב-localStorage
        const newUser = new User({
            username,
            password,
            firstName,
            lastName,
            email,
            dateOfBirth,
            city,
            street,
            houseNumber,
            profileImage: profileImageBase64
        });

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
// הצגת הודעת הצלחה למשתמש עם אפשרות לאישור והעברה לדף ההתחברות
        Swal.fire({
            title: 'ההרשמה בוצעה בהצלחה!',
            text: 'ברוך הבא! מועבר לדף ההתחברות...',
            icon: 'success',
            confirmButtonText: 'אישור',
            confirmButtonColor: '#3085d6',
            backdrop: `rgba(0,0,0,0.4)`
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'index.html';
            }
        });
    });
}
//פונקציה א-סינכרונית שרצה אוטמטית ברגע שהעמוד נטען ושולפת את קובץ רשימת הערים בכדי לשמור אותה במשתנה citiesDatabase
async function initRegistration() {
    try {
        const response = await fetch('./cities.json');
        citiesDatabase = await response.json();
    } catch (error) {
        console.error("שגיאה בטעינת רשימת הערים:", error);
    }
}

document.addEventListener('DOMContentLoaded', initRegistration);