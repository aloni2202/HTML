import { User, getAllUsers, validatePassword, validateAge, validateEmailFormat } from './functions.js';

// מאגר ערים זמני
const citiesDatabase = [
    "תל אביב", "ירושלים", "חיפה", "נתניה", "הרצליה",
    "ראשון לציון", "פתח תקווה", "חולון", "באר שבע"
];

const registrationForm = document.querySelector('form');
const profileImageInput = document.getElementById('profileImage');
const profileImageName = document.getElementById('profileImageName');
const errorContainer = document.getElementById('registrationError');
const cityInput = document.getElementById('city');
const citiesList = document.getElementById('citiesList');

let profileImageBase64 = '';

// הצגת הודעות שגיאה בטופס
function showError(message) {
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.classList.remove('d-none');
    }
}

// מנגנון אוטוקומפליט לשדה עיר
function updateCityOptions(filterValue) {
    if (!citiesList) return;
    citiesList.innerHTML = '';
    if (!filterValue) return;

    // סינון ערים המכילות את האות שהוקלדה
    const filteredCities = citiesDatabase.filter((cityName) => cityName.includes(filterValue));

    // מיון חכם: ערים שמתחילות באות שהוקלדה יופיעו קודם
    filteredCities.sort((a, b) => {
        const aStartsWith = a.startsWith(filterValue);
        const bStartsWith = b.startsWith(filterValue);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.localeCompare(b);
    });

    // הזרקת האופציות לתוך ה-Datalist
    filteredCities.forEach((cityName) => {
        const option = document.createElement('option');
        option.value = cityName;
        option.textContent = cityName;
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

// אירוע שליחת טופס ההרשמה
registrationForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (errorContainer) {
        errorContainer.textContent = '';
        errorContainer.classList.add('d-none');
    }

    const username = document.getElementById('userName').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('familyName').value.trim();
    const email = document.getElementById('emailAddress').value.trim();
    const dateOfBirth = document.getElementById('birthDate').value;
    const city = document.getElementById('city').value.trim();
    const street = document.getElementById('street').value.trim();
    const houseNumberValue = document.getElementById('houseNumber').value.trim();

    // בדיקת שדות חובה ריקים
    if (!username || !password || !confirmPassword || !firstName || !lastName || !email || !dateOfBirth || !city || !street || !houseNumberValue) {
        showError('יש למלא את כל השדות.');
        return;
    }

    // ולידציית רחוב (אותיות בעברית בלבד)
    if (!/^[א-ת\s]+$/u.test(street)) {
        showError('שם הרחוב חייב להכיל רק אותיות עבריות.');
        return;
    }

    // ולידציית מספר בית (חיובי בלבד)
    const houseNumber = Number(houseNumberValue);
    if (houseNumber <= 0) {
        showError('מספר הבית חייב להיות מספר חיובי.');
        return;
    }

    // בדיקת התאמת סיסמאות
    if (password !== confirmPassword) {
        showError('הסיסמה ואימות הסיסמה לא תואמים.');
        return;
    }

    // ולידציית מורכבות סיסמה
    if (!validatePassword(password)) {
        showError('הסיסמה חייבת להכיל 7-12 תווים, אות גדולה, מספר ותו מיוחד.');
        return;
    }

    // ולידציית גיל תקין
    if (!validateAge(dateOfBirth)) {
        showError('תאריך הלידה אינו חוקי (גיל בין 0 ל-120).');
        return;
    }

    // ולידציית פורמט מייל
    if (!validateEmailFormat(email)) {
        showError('האימייל חייב לכלול @ אחד בלבד ולהסתיים ב-.com.');
        return;
    }

    // בדיקה שהמייל אינו קיים כבר במערכת
    const users = getAllUsers();
    // הקוד המאובטח החדש
    const emailExists = users.some((user) => user && user.email && user.email.toLowerCase() === email.toLowerCase()); if (emailExists) {
        showError('כתובת האימייל כבר קיימת במערכת.');
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

    // הודעה וניתוב מחדש
    alert("ההרשמה בוצעה בהצלחה! מועבר לדף ההתחברות.");
    window.location.href = 'index.html';
});