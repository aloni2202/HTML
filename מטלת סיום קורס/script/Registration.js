import { User, getAllUsers, validatePassword, validateAge, validateEmailFormat } from './functions.js';

let citiesDatabase = [];

const registrationForm = document.querySelector('form');
const profileImageInput = document.getElementById('profileImage');
const profileImageName = document.getElementById('profileImageName');
const errorContainer = document.getElementById('registrationError');
const cityInput = document.getElementById('city');
const citiesList = document.getElementById('citiesList');

let profileImageBase64 = '';

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

        if (!username || !password || !confirmPassword || !firstName || !lastName || !email || !dateOfBirth || !city || !street || !houseNumberValue) {
            showError('יש למלא את כל השדות בטופס.');
            return;
        }

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

async function initRegistration() {
    try {
        const response = await fetch('./cities.json'); 
        citiesDatabase = await response.json();
    } catch (error) {
        console.error("שגיאה בטעינת רשימת הערים:", error);
    }
}

document.addEventListener('DOMContentLoaded', initRegistration);