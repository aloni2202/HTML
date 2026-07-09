import { User, getAllUsers, validatePassword, validateAge, validateEmailFormat } from './functions.js';

const registrationForm = document.querySelector('form');
const profileImageInput = document.getElementById('profileImage');
const profileImageName = document.getElementById('profileImageName');
const errorContainer = document.getElementById('registrationError');
const cityInput = document.getElementById('city');
const citiesList = document.getElementById('citiesList');

let profileImageBase64 = '';

function updateCityOptions(filterValue) {
    if (!citiesList) {
        return;
    }

    citiesList.innerHTML = '';

    if (!filterValue) {
        return;
    }

    const lowerCaseFilter = filterValue.toLowerCase();
    const filteredCities = citiesDatabase.filter((cityName) =>
        cityName.toLowerCase().includes(lowerCaseFilter)
    );

    filteredCities.forEach((cityName) => {
        const option = document.createElement('option');
        option.value = cityName;
        citiesList.appendChild(option);
    });
}

if (cityInput) {
    cityInput.addEventListener('input', () => {
        const value = cityInput.value.trim();
        updateCityOptions(value);
    });
}

function showError(message) {
    if (!errorContainer) {
        alert(message);
        return;
    }

    errorContainer.textContent = message;
    errorContainer.classList.remove('d-none');
}

function clearError() {
    if (!errorContainer) {
        return;
    }

    errorContainer.textContent = '';
    errorContainer.classList.add('d-none');
}

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
    const defaultLabel = 'פורמטים נתמכים: JPG, JPEG';

    if (!file) {
        profileImageName.textContent = defaultLabel;
        profileImageBase64 = '';
        return;
    }

    const fileName = file.name;
    const isValidExtension = /\.(jpe?g)$/i.test(fileName);

    if (!isValidExtension) {
        profileImageName.textContent = defaultLabel;
        profileImageInput.value = '';
        profileImageBase64 = '';
        showError('בחר קובץ JPG או JPEG בלבד.');
        return;
    }

    profileImageName.textContent = `נבחר: ${fileName}`;
    clearError();

    try {
        profileImageBase64 = await getSelectedFileBase64(file);
    } catch (error) {
        profileImageName.textContent = defaultLabel;
        profileImageInput.value = '';
        profileImageBase64 = '';
        showError('לא ניתן לקרוא את קובץ התמונה.');
    }
});

registrationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearError();

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

    if (!username || !password || !confirmPassword || !firstName || !lastName || !email || !dateOfBirth || !city || !street || !houseNumberValue) {
        showError('יש למלא את כל השדות.');
        return;
    }

    const streetPattern = /^[א-ת\s]+$/u;
    if (!streetPattern.test(street)) {
        showError('שם הרחוב חייב להכיל רק אותיות עבריות ורווחים.');
        return;
    }

    const houseNumber = Number(houseNumberValue);
    if (!Number.isInteger(houseNumber) || houseNumber <= 0) {
        showError('מספר הבית חייב להיות מספר חיובי.');
        return;
    }

    if (password !== confirmPassword) {
        showError('הסיסמה ואימות הסיסמה לא תואמים.');
        return;
    }

    if (!validatePassword(password)) {
        showError('הסיסמה חייבת להכיל 7-12 תווים, אות גדולה, מספר ותו מיוחד.');
        return;
    }

    if (!validateAge(dateOfBirth)) {
        showError('תאריך הלידה אינו חוקי. יש להזין גיל בין 1 ל-119.');
        return;
    }

    if (!validateEmailFormat(email)) {
        showError('האימייל חייב לכלול @ אחד בלבד ולהסתיים ב-.com.');
        return;
    }

    const users = getAllUsers();
    const emailExists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());

    if (emailExists) {
        showError('כתובת האימייל כבר קיימת במערכת.');
        return;
    }

    if (!profileImageBase64) {
        showError('אנא העלה תמונת פרופיל בפורמט JPG או JPEG.');
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
        profileImage: profileImageBase64,
    });

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    window.location.href = 'index.html';
});
