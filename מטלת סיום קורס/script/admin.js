import { 
    checkAdminPermission, 
    getRegularUsers, 
    formatUserData, 
    deleteUserByUsername, 
    navigateToEditProfile 
} from './functions.js';

document.addEventListener('DOMContentLoaded', function() {
    const adminTable = document.getElementById('adminUsersTable');
    if (!adminTable) return; 

    const tableBody = adminTable.querySelector('tbody');
    const usersCountEl = document.getElementById('usersCount');

   if (!checkAdminPermission()) {
        Swal.fire({
            title: 'עמוד למנהלים בלבד',
            text: 'עליך להזדהות כמנהל',
            icon: 'warning',
            confirmButtonText: 'אישור',
            confirmButtonColor: '#0f3b66'
        }).then(() => {
            window.location.href = 'index.html';
        });
        return;
    }
    function renderAdminTable() {
        const regularUsers = getRegularUsers();

        if (usersCountEl) {
            usersCountEl.textContent = regularUsers.length;
        }

        tableBody.innerHTML = '';

        if (regularUsers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: #718096;">אין משתמשים רשומים במערכת.</td></tr>`;
            return;
        }

        regularUsers.forEach(function(user) {
            const tr = document.createElement('tr');
            const formatted = formatUserData(user);

            tr.innerHTML = `
                <td><strong>${user.username || ''}</strong></td>
                <td>${formatted.fullName}</td>
                <td>${formatted.birthDateDisplay}</td>
                <td>${formatted.fullAddress}</td>
                <td>${user.email || ''}</td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-delete">מחיקה</button>
                        <button class="btn-edit">עריכה</button>
                    </div>
                </td>
            `;

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
                        deleteUserByUsername(user.username);
                        renderAdminTable(); 
                        Swal.fire({
                            title: 'נמחק!',
                            text: 'המשתמש הוסר בהצלחה מהמערכת.',
                            icon: 'success',
                            confirmButtonColor: '#0f3b66'
                        });
                    }
                });
            });

          
            tr.querySelector('.btn-edit').addEventListener('click', function() {
                navigateToEditProfile(user.username);
            });

            tableBody.appendChild(tr);
        });
    }

    renderAdminTable();
});