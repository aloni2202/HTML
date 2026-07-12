// --- לוגיקת דף מנהל המערכת (Admin Page) ---
document.addEventListener('DOMContentLoaded', function() {
    const adminTable = document.getElementById('adminUsersTable');
    if (!adminTable) return; 

    const tableBody = adminTable.querySelector('tbody');
    const usersCountEl = document.getElementById('usersCount');

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        alert('גישה חסומה! אין לך הרשאות לצפות בדף זה.');
        window.location.href = 'index.html';
        return;
    }

    function renderAdminTable() {
        // משיכה מתוך המפתח users של אלון
        let dbUsers = JSON.parse(localStorage.getItem('users')) || [];
        
        if (usersCountEl) {
            usersCountEl.textContent = dbUsers.length;
        }

        tableBody.innerHTML = '';

        if (dbUsers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">אין משתמשים רשומים במערכת.</td></tr>`;
            return;
        }

        dbUsers.forEach(function(user, index) {
            const tr = document.createElement('tr');
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

            tr.querySelector('.btn-delete').addEventListener('click', function() {
                if (confirm(`האם אתה בטוח שברצונך למחוק את המשתמש ${user.username}?`)) {
                    deleteUser(index);
                }
            });

            tr.querySelector('.btn-edit').addEventListener('click', function() {
                localStorage.setItem('editUserTarget', user.username);
                window.location.href = 'RegistrationForm.html'; 
            });

            tableBody.appendChild(tr);
        });
    }

    function deleteUser(index) {
        let dbUsers = JSON.parse(localStorage.getItem('users')) || [];
        dbUsers.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(dbUsers)); // שמירה חזרה ל-users
        renderAdminTable();
    }

    renderAdminTable();
});