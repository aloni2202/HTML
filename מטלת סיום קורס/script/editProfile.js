import { User, getAllUsers, validatePassword, validateAge, validateEmailFormat } from './functions.js';

let citiesDatabase = []; 

const profileImageInput = document.getElementById('profileImage');
const profileImageName = document.getElementById('profileImageName');
const profileImagePreview = document.getElementById('profilePreview');
const cityInput = document.getElementById('city');
const citiesList = document.getElementById('citiesList');
const editForm = document.querySelector('form');
const errorContainer = document.getElementById('registrationError');

let originalUser = null; // המשתמש שאת פרטיו עורכים כרגע
let profileImageBase64 = ''; 
let isModeAdminEditing = false; // דגל שמסמן האם מנהל עורך כרגע משתמש אחר

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

function clearError() {
    if (!errorContainer) return;
    errorContainer.textContent = '';
    errorContainer.classList.add('d-none');
}

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

function getSelectedFileBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('שגיאה בקריאת קובץ התמונה'));
        reader.readAsDataURL(file);
    });
}

function setProfilePreview(src) {
    if (!profileImagePreview) return;
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

    // 🌟 אם מנהל עורך, נסתיר או ננטרל את שדות הסיסמה בטופס
    if (isModeAdminEditing) {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (passwordInput) passwordInput.disabled = true;
        if (confirmPasswordInput) confirmPasswordInput.disabled = true;
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    clearError();

    // קריאת הערכים מהטופס
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

    // 🌟 פתרון דרישה במצב מנהל: אם שדה ריק, לוקחים את ברירת המחדל המקורית של המשתמש
    const finalUsername = username || originalUser.username;
    const finalFirstName = firstName || originalUser.firstName;
    const finalLastName = lastName || originalUser.lastName;
    const finalEmail = email || originalUser.email;
    const finalDateOfBirth = dateOfBirth || originalUser.dateOfBirth;
    const finalCity = city || originalUser.city;
    const finalStreet = street || originalUser.street;
    const finalHouseNumber = houseNumberValue ? Number(houseNumberValue) : originalUser.houseNumber;
    const finalProfileImage = profileImageBase64 || originalUser.profileImage;

    // 1. בדיקת שדות ריקים - חלה רק על משתמש רגיל! מנהל פטור ויקבל ברירות מחדל
    if (!isModeAdminEditing) {
        if (!username || !firstName || !lastName || !email || !dateOfBirth || !city || !street || !houseNumberValue) {
            showError('יש למלא את כל השדות בטופס.');
            return;
        }
    }

    // 2. חסימת אותיות בעברית בשם המשתמש
    const usernamePattern = /^[A-Za-z0-9!@#$%^&*()_+={}[\]|\\:;'<>,.?/-]+$/;
    if (finalUsername && !usernamePattern.test(finalUsername)) {
        showError('שם המשתמש אינו חוקי. יש להשתמש באותיות באנגלית, מספרים וסימנים בלבד (ללא עברית).');
        return;
    }

    // 3. בדיקת רחוב בעברית
    const streetPattern = /^[א-ת\s]+$/u;
    if (finalStreet && !streetPattern.test(finalStreet)) {
        showError('שם הרחוב שגוי. יש להזין רק אותיות בעברית ורווחים.');
        return;
    }

    // 4. מספר בית חיובי
    if (finalHouseNumber && (!Number.isInteger(finalHouseNumber) || finalHouseNumber <= 0)) {
        showError('מספר הבית אינו תקין. יש להזין מספר חיובי שלם.');
        return;
    }

    // 5. תקינות סיסמה (רק למשתמש רגיל ובמידה והזין ערך חדש)
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

    // 6. בדיקת גיל
    if (finalDateOfBirth && !validateAge(finalDateOfBirth)) {
        showError('תאריך הלידה אינו תקין. הגיל במערכת מוגבל בין 1 ל-119.');
        return;
    }

    // 7. פורמט אימייל
    if (finalEmail && !validateEmailFormat(finalEmail)) {
        showError('כתובת האימייל אינה במבנה תקין. יש להזין אימייל הכולל @ ומסתיים ב- .com');
        return;
    }

    // 8. בדיקת כפל מיילים מוגנת
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

    // בניית אובייקט משתמש מעודכן
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

    // עדכון במערך הגלובלי
    const userIndex = users.findIndex((user) => originalUser && user.email && user.email.toLowerCase() === originalUser.email.toLowerCase());
    if (userIndex >= 0) {
        users[userIndex] = updatedUser;
    } else {
        users.push(updatedUser);
    }

    localStorage.setItem('users', JSON.stringify(users));

    // עדכון ה-session רק אם המשתמש הנוכחי עדכן את עצמו (ולא מנהל שעדכן מישהו אחר)
    if (!isModeAdminEditing) {
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }

    // ניקוי מפתח העריכה של האדמין בסיום
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

    // 🌟 בדיקה האם מדובר במנהל שהגיע לערוך משתמש ספציפי
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
        // מצב רגיל - משתמש עורך את עצמו
        originalUser = loggedInUser;
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
                showError('סוג הקובץ אינו נתמך. יש לבחור קובץ JPG או JPEG בלבד.');
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
                showError('אירעה שגיאה בקריאת קובץ התמונה שבחרת.');
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