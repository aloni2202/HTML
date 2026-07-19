// --- לוגיקת דף מנהל המערכת (Admin Page) ---
document.addEventListener('DOMContentLoaded', function() {
    const adminTable = document.getElementById('adminUsersTable');
    if (!adminTable) return; 

    const tableBody = adminTable.querySelector('tbody');
    const usersCountEl = document.getElementById('usersCount');

    // בדיקת הרשאות מנהל
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        Swal.fire({
            title: 'גישה חסומה!',
            text: 'אין לך הרשאות לצפות בדף זה.',
            icon: 'error',
            confirmButtonText: 'אישור',
            confirmButtonColor: '#0f3b66'
        }).then(() => {
            window.location.href = 'index.html';
        });
        return;
    }

    function renderAdminTable() {
        let dbUsers = JSON.parse(localStorage.getItem('users')) || [];
        
        if (usersCountEl) {
            usersCountEl.textContent = dbUsers.length;
        }

        tableBody.innerHTML = '';

        if (dbUsers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: #718096;">אין משתמשים רשומים במערכת.</td></tr>`;
            return;
        }

        dbUsers.forEach(function(user, index) {
            const tr = document.createElement('tr');
            
            // עיבוד הנתונים התואם לשדות של הפרויקט
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'לא הוזן';
            const fullAddress = `${user.street || ''} ${user.houseNumber || ''}, ${user.city || ''}`.trim() || 'לא הוזן';
            const birthDateDisplay = user.dateOfBirth || 'לא הוזן';

            tr.innerHTML = `
                <td><strong>${user.username || ''}</strong></td>
                <td>${fullName}</td>
                <td>${birthDateDisplay}</td>
                <td>${fullAddress}</td>
                <td>${user.email || ''}</td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-delete">מחיקה</button>
                        <button class="btn-edit">עריכה</button>
                    </div>
                </td>
            `;

            // מנגנון מחיקה מאובטח ויפה
            tr.querySelector('.btn-delete').addEventListener('click', function() {
                Swal.fire({
                    title: 'האם אתם בטוחים?',
                    text: `אתם עומדים למחוק את המשתמש: ${user.username}`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#e53e3e',
                    cancelButtonColor: '#718096',
                    confirmButtonText: 'כן, מחקו משתמש',
                    cancelButtonText: 'ביטול'
                }).then((result) => {
                    if (result.isConfirmed) {
                        deleteUser(index);
                        Swal.fire({
                            title: 'נמחק!',
                            text: 'המשתמש הוסר בהצלחה מהמערכת.',
                            icon: 'success',
                            confirmButtonColor: '#0f3b66'
                        });
                    }
                });
            });

            // 🌟 מנגנון עריכה מתוקן: מעביר לעמוד עריכת הפרופיל הנכון במקום להרשמה
            tr.querySelector('.btn-edit').addEventListener('click', function() {
                localStorage.setItem('editUserTarget', user.username);
                window.location.href = 'edit-profile.html'; 
            });

            tableBody.appendChild(tr);
        });
    }

    function deleteUser(index) {
        let dbUsers = JSON.parse(localStorage.getItem('users')) || [];
        dbUsers.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(dbUsers));
        renderAdminTable();
    }

    renderAdminTable();
});