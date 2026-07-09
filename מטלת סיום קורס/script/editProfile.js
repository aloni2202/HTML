import { User, getAllUsers, validatePassword, validateAge, validateEmailFormat } from './functions.js';

const citiesDatabase = ['תל אביב', 'ירושלים', 'חיפה', 'נתניה', 'הרצליה', 'ראשון לציון'];

const profileImageInput = document.getElementById('profileImage');
const profileImageName = document.getElementById('profileImageName');
const profileImagePreview = document.getElementById('profilePreview');
const cityInput = document.getElementById('city');
const citiesList = document.getElementById('citiesList');
const editForm = document.querySelector('form');
const errorContainer = document.getElementById('registrationError');

let originalUser = null;
let profileImageBase64 = '';

function showError(message) {
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.classList.remove('d-none');
        return;
    }

    alert(message);
}

function clearError() {
    if (!errorContainer) {
        return;
    }

    errorContainer.textContent = '';
    errorContainer.classList.add('d-none');
}

function updateCityOptions(filterValue) {
    if (!citiesList) {
        return;
    }

    citiesList.innerHTML = '';

    if (!filterValue) {
        return;
    }

    const normalizedFilter = filterValue.toLowerCase();
    const filteredCities = citiesDatabase.filter((cityName) =>
        cityName.toLowerCase().includes(normalizedFilter)
    );

    filteredCities.forEach((cityName) => {
        const option = document.createElement('option');
        option.value = cityName;
        citiesList.appendChild(option);
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

function setProfilePreview(src) {
    if (!profileImagePreview) {
        return;
    }

    profileImagePreview.src = src || '';
}

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
}

function handleFormSubmit(event) {
    event.preventDefault();
    clearError();

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

    if (!username || !firstName || !lastName || !email || !dateOfBirth || !city || !street || !houseNumberValue) {
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

    if (password || confirmPassword) {
        if (password !== confirmPassword) {
            showError('הסיסמה ואימות הסיסמה לא תואמים.');
            return;
        }

        if (!validatePassword(password)) {
            showError('הסיסמה חייבת להכיל 7-12 תווים, אות גדולה, מספר ותו מיוחד.');
            return;
        }
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
    const emailExists = users.some((user) => {
        const isSameUser = originalUser && user.email.toLowerCase() === originalUser.email.toLowerCase();
        return !isSameUser && user.email.toLowerCase() === email.toLowerCase();
    });

    if (emailExists) {
        showError('כתובת האימייל כבר קיימת במערכת.');
        return;
    }

    if (!profileImageBase64) {
        showError('אנא העלה תמונת פרופיל בפורמט JPG או JPEG.');
        return;
    }

    const updatedUser = new User({
        username,
        password: password || originalUser.password,
        firstName,
        lastName,
        email,
        dateOfBirth,
        city,
        street,
        houseNumber,
        profileImage: profileImageBase64,
    });

    const userIndex = users.findIndex((user) => originalUser && user.email.toLowerCase() === originalUser.email.toLowerCase());
    if (userIndex >= 0) {
        users[userIndex] = updatedUser;
    } else {
        users.push(updatedUser);
    }

    localStorage.setItem('users', JSON.stringify(users));
    sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
    alert('הפרופיל עודכן בהצלחה.');
    window.location.href = 'profile.html';
}

function init() {
    const rawCurrentUser = sessionStorage.getItem('currentUser');
    if (!rawCurrentUser) {
        window.location.href = 'loginPage.html';
        return;
    }

    try {
        originalUser = JSON.parse(rawCurrentUser);
    } catch (error) {
        window.location.href = 'loginPage.html';
        return;
    }

    populateForm(originalUser);

    if (profileImageInput) {
        profileImageInput.addEventListener('change', async () => {
            const file = profileImageInput.files[0];
            const defaultLabel = 'פורמטים נתמכים: JPG, JPEG';

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

            if (!isValidExtension) {
                if (profileImageName) {
                    profileImageName.textContent = defaultLabel;
                }
                profileImageInput.value = '';
                profileImageBase64 = originalUser.profileImage || '';
                showError('בחר קובץ JPG או JPEG בלבד.');
                return;
            }

            if (profileImageName) {
                profileImageName.textContent = `נבחר: ${fileName}`;
            }

            clearError();

            try {
                profileImageBase64 = await getSelectedFileBase64(file);
                setProfilePreview(profileImageBase64);
            } catch (error) {
                if (profileImageName) {
                    profileImageName.textContent = defaultLabel;
                }
                profileImageInput.value = '';
                profileImageBase64 = originalUser.profileImage || '';
                showError('לא ניתן לקרוא את קובץ התמונה.');
            }
        });
    }

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
