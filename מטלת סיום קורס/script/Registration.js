import { User, getAllUsers, validatePassword, validateAge, validateEmailFormat } from './functions.js';

// 🌟 משתנה ריק שיתמלא בצורה דינמית מקובץ ה-JSON המקומי שלך
let citiesDatabase = [];

const registrationForm = document.querySelector('form');
const profileImageInput = document.getElementById('profileImage');
const profileImageName = document.getElementById('profileImageName');
const errorContainer = document.getElementById('registrationError');
const cityInput = document.getElementById('city');
const citiesList = document.getElementById('citiesList');

let profileImageBase64 = '';

// 🌟 עדכון: הצגת הודעות שגיאה בחלונית SweetAlert2 מעוצבת במרכז המסך
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

// 🌟 מנגנון אוטוקומפליט מעודכן שמתאים למבנה האובייקטים של ה-JSON החדש
function updateCityOptions(filterValue) {
    if (!citiesList) return;
    citiesList.innerHTML = '';
    if (!filterValue) return;

    const normalizedFilter = filterValue.toLowerCase();

    // סינון מתוך המבנה של האובייקטים החדשים
    const filteredCities = citiesDatabase.filter((cityObj) => 
        cityObj["שם_ישוב"] && cityObj["שם_ישוב"].toLowerCase().includes(normalizedFilter)
    );

    // מיון חכם: ערים שמתחילות באות שהוקלדה יופיעו קודם
    filteredCities.sort((a, b) => {
        const aName = a["שם_ישוב"];
        const bName = b["שם_ישוב"];
        const aStartsWith = aName.startsWith(filterValue);
        const bStartsWith = bName.startsWith(filterValue);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return aName.localeCompare(bName);
    });

    // הזרקת האופציות לתוך ה-Datalist
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

// קריאת קובץ התמונה והמרתו ל-Base64
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

        // בדיקת סיומת הקובץ (JPG או JPEG בלבד)
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

// אירוע שליחת טופס ההרשמה
if (registrationForm) {
    registrationForm.addEventListener('submit', (event) => {
        event.preventDefault();

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

        // 1. בדיקת שדות חובה ריקים
        if (!username || !password || !confirmPassword || !firstName || !lastName || !email || !dateOfBirth || !city || !street || !houseNumberValue) {
            showError('יש למלא את כל השדות בטופס.');
            return;
        }

        // 2. ולידציה לחסימת עברית בשם המשתמש
        const usernameRegex = /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
        if (!usernameRegex.test(username)) {
            showError('שם המשתמש אינו חוקי. יש להשתמש באותיות באנגלית, מספרים וסימנים בלבד (ללא עברית).');
            return;
        }

        // 3. ולידציית רחוב (אותיות בעברית בלבד)
        if (!/^[א-ת\s]+$/u.test(street)) {
            showError('שם הרחוב שגוי. יש להזין רק אותיות בעברית ורווחים.');
            return;
        }

        // 4. ולידציית מספר בית (חיובי בלבד)
        const houseNumber = Number(houseNumberValue);
        if (!Number.isInteger(houseNumber) || houseNumber <= 0) {
            showError('מספר הבית אינו תקין. יש להזין מספר חיובי שלם.');
            return;
        }

        // 5. בדיקת התאמת סיסמאות
        if (password !== confirmPassword) {
            showError('הסיסמאות שנקלטו אינן תואמות. אנא ודא ששתי הסיסמאות זהות.');
            return;
        }

        // 6. ולידציית מורכבות סיסמה
        if (!validatePassword(password)) {
            showError('הסיסמה חלשה מדי. עליה להכיל 7-12 תווים, אות גדולה, מספר ותו מיוחד.');
            return;
        }

        // 7. ולידציית גיל תקין
        if (!validateAge(dateOfBirth)) {
            showError('תאריך הלידה אינו תקין. הגיל במערכת מוגבל בין 1 ל-119.');
            return;
        }

        // 8. ולידציית פורמט מייל
        if (!validateEmailFormat(email)) {
            showError('כתובת האימייל אינה במבנה תקין. יש להזין אימייל הכולל @ ומסתיים ב- .com');
            return;
        }

        // 9. בדיקת כפל מיילים מאובטחת ומניעת קריסות
        const users = getAllUsers();
        const emailExists = users.some((user) => user && user.email && user.email.toLowerCase() === email.toLowerCase()); 
        if (emailExists) {
            showError('כתובת האימייל שהזנת כבר קיימת במערכת בשימוש של משתמש אחר.');
            return;
        }

        // 10. בדיקת תמונת פרופיל חובה בהרשמה ראשונית
        if (!profileImageBase64) {
            showError('אנא העלה תמונת פרופיל בפורמט JPG או JPEG כדי להשלים את ההרשמה.');
            return;
        }

        // יצירת המשתמש החדש
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

        // שמירה ב-Local Storage
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // הודעה מעוצבת במרכז המסך וניתוב מחדש
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

// 🌟 טעינה אסינכרונית של קובץ ה-JSON המקומי עם פתיחת עמוד ההרשמה
async function initRegistration() {
    try {
        const response = await fetch('./cities.json'); // קריאה לקובץ ה-JSON המקומי שלך
        citiesDatabase = await response.json();
    } catch (error) {
        console.error("שגיאה בטעינת רשימת הערים:", error);
    }
}

document.addEventListener('DOMContentLoaded', initRegistration);