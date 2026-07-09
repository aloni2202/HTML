document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('errorMsg');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            if (typeof clearError === 'function') {
                clearError(errorMsg);
            }

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (!username || !password) {
                if (typeof showError === 'function') {
                    showError(errorMsg, 'שם משתמש וסיסמה הם שדות חובה.');
                } else {
                    errorMsg.textContent = 'שם משתמש וסיסמה הם שדות חובה.';
                    errorMsg.style.display = 'block';
                }
                return;
            }

            if (username === 'admin' && password === 'admin1234admin') {
                sessionStorage.setItem('currentUser', JSON.stringify({ username: 'admin', role: 'admin' }));
                alert('חיבור מנהל הצליח! מעביר לדף מנהל...');
                window.location.href = 'adminPage.html';
                return;
            }

            let usersList;
            try {
                usersList = JSON.parse(localStorage.getItem('usersList')) || [];
            } catch (err) {
                usersList = [];
            }

            if (!Array.isArray(usersList) || usersList.length === 0) {
                if (typeof showError === 'function') {
                    showError(errorMsg, 'לא נמצאו משתמשים רשומים במערכת.');
                } else {
                    errorMsg.textContent = 'לא נמצאו משתמשים רשומים במערכת.';
                    errorMsg.style.display = 'block';
                }
                return;
            }

            const foundUser = usersList.find(u => u.username === username && u.password === password);

            if (foundUser) {
                sessionStorage.setItem('currentUser', JSON.stringify(foundUser));
                alert('ברוך הבא, ' + username + '! מעביר לפרופיל...');
                window.location.href = 'profile.html';
            } else {
                if (typeof showError === 'function') {
                    showError(errorMsg, 'שם משתמש או סיסמה שגויים.');
                } else {
                    errorMsg.textContent = 'שם משתמש או סיסמה שגויים.';
                    errorMsg.style.display = 'block';
                }
            }
        });
    }

    const adminTableBody = document.querySelector('#adminUsersTable tbody');
    const usersCountEl = document.getElementById('usersCount');

    if (!adminTableBody) return;

    const currentUserData = sessionStorage.getItem('currentUser');
    let currentUser = null;

    try {
        currentUser = currentUserData ? JSON.parse(currentUserData) : null;
    } catch (err) {
        currentUser = null;
    }

    if (!currentUser || currentUser.role !== 'admin') {
        alert('גישה חסומה!');
        window.location.href = 'loginPage.html';
        return;
    }

    let usersList = [];

    function loadUsers() {
        try {
            const stored = localStorage.getItem('usersList');
            usersList = stored ? JSON.parse(stored) : [];
            if (!Array.isArray(usersList)) {
                usersList = [];
            }
        } catch (err) {
            usersList = [];
        }
    }

    function saveUsers() {
        localStorage.setItem('usersList', JSON.stringify(usersList));
    }

    function renderTable() {
        adminTableBody.innerHTML = '';
        usersCountEl.textContent = usersList.length;

        if (usersList.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td class="table-empty" colspan="6">לא נמצאו משתמשים רשומים.</td>';
            adminTableBody.appendChild(emptyRow);
            return;
        }

        usersList.forEach((user, index) => {
            const row = document.createElement('tr');
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            const address = `${user.street || ''} ${user.number || ''} ${user.city || ''}`.trim();

            row.innerHTML = `
                <td>${user.username || ''}</td>
                <td>${fullName || '-'}</td>
                <td>${user.birthdate || '-'}</td>
                <td>${address || '-'}</td>
                <td>${user.email || '-'}</td>
                <td>
                    <div class="action-group">
                        <button type="button" class="btn-action btn-delete" aria-label="מחק משתמש ${user.username || ''}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M9 3h6v1H9V3Zm-2 4h10l-1.2 12.3c-.1 1.2-1 2.1-2.2 2.1H8.4c-1.2 0-2.1-.9-2.2-2.1L5 7Zm3 3v8h2v-8H10Zm4 0v8h2v-8h-2Z" fill="currentColor"/>
                            </svg>
                        </button>
                        <button type="button" class="btn-action btn-edit" aria-label="ערוך משתמש ${user.username || ''}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.99-1.66Z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                </td>
            `;

            const deleteButton = row.querySelector('.btn-delete');
            deleteButton.addEventListener('click', function () {
                if (!confirm(`להחליט למחוק את המשתמש ${user.username || ''}?`)) {
                    return;
                }
                usersList.splice(index, 1);
                saveUsers();
                renderTable();
            });

            adminTableBody.appendChild(row);
        });
    }

    loadUsers();
    renderTable();
});
// --- לוגיקת דף מנהל המערכת (Admin Page) ---
document.addEventListener('DOMContentLoaded', function() {
    // בדיקה האם אנחנו נמצאים פיזית בדף המנהל (לפי קיום הטבלה הייחודית)
    const adminTable = document.getElementById('adminUsersTable');
    if (!adminTable) return; // אם הטבלה לא קיימת, הקוד הבא לא ירוץ (למשל בדף ה-Login)

    const tableBody = adminTable.querySelector('tbody');
    const usersCountEl = document.getElementById('usersCount');

    // 1. הגנת דף חובה: בדיקה האם המשתמש הנוכחי מחובר והוא אכן אדמין
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        alert('גישה חסומה! אין לך הרשאות לצפות בדף זה.');
        window.location.href = 'loginPage.html';
        return;
    }

    // פונקציה לרישום ורינדור הטבלה מחדש בכל פעם שיש שינוי
    function renderAdminTable() {
        // משיכת רשימת המשתמשים המעודכנת מה-Local Storage
        let usersList = JSON.parse(localStorage.getItem('usersList')) || [];
        
        // עדכון מונה המשתמשים בלוח הבקרה
        if (usersCountEl) {
            usersCountEl.textContent = usersList.length;
        }

        // ניקוי הטבלה הקיימת לפני רינדור מחדש
        tableBody.innerHTML = '';

        // במידה ואין אף משתמש רשום במאגר
        if (usersList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">אין משתמשים רשומים במערכת.</td></tr>`;
            return;
        }

        // ריצה על המערך ובניית השורות בטבלה באופן דינמי
        usersList.forEach(function(user, index) {
            const tr = document.createElement('tr');

            // חיבור שם מלא וכתובת מלאה בהתאם למבנה אובייקט User
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'לא הוזן';
            const fullAddress = `${user.street || ''} ${user.number || ''}, ${user.city || ''}`.trim() || 'לא הוזן';

            tr.innerHTML = `
                <td>${user.username || ''}</td>
                <td>${fullName}</td>
                <td>${user.birthDate || 'לא הוזן'}</td>
                <td>${fullAddress}</td>
                <td>${user.email || ''}</td>
                <td>
                    <button class="btn-delete" style="background: #e53e3e; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-left: 4px;">מחיקה</button>
                    <button class="btn-edit" style="background: #2b6cb0; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">עריכה</button>
                </td>
            `;

            // האזנה לכפתור מחיקה
            tr.querySelector('.btn-delete').addEventListener('click', function() {
                if (confirm(`האם אתה בטוח שברצונך למחוק את המשתמש ${user.username}?`)) {
                    deleteUser(index);
                }
            });

            // האזנה לכפתור עריכה (נפנה כרגע לעמוד ההרשמה/עריכה או נשאיר לוגיקה פתוחה)
            tr.querySelector('.btn-edit').addEventListener('click', function() {
                // נשמור זמנית את שם המשתמש שרוצים לערוך כדי שחבר הצוות יוכל למשוך אותו
                localStorage.setItem('editUserTarget', user.username);
                window.location.href = 'RegistrationForm.html'; // או קובץ עריכה ייעודי בהתאם להחלטתכם
            });

            tableBody.appendChild(tr);
        });
    }

    // פונקציה למחיקת משתמש מהמאגר לפי ה-Index שלו במערך
    function deleteUser(index) {
        let usersList = JSON.parse(localStorage.getItem('usersList')) || [];
        
        // הסרת המשתמש הספציפי מהמערך
        usersList.splice(index, 1);
        
        // שמירת המערך המעודכן חזרה ל-Local Storage
        localStorage.setItem('usersList', JSON.stringify(usersList));
        
        // הרצה מחדש של הטבלה כדי לעדכן את התצוגה במקום
        renderAdminTable();
    }

    // קריאה ראשונית לפונקציה כדי להציג את הטבלה עם טעינת הדף
    renderAdminTable();
});