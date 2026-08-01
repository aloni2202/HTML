import { setCurrentBoardSize } from './battleshipVars.js';
import { initBoardMatrix, generateRandomShips, drawGridDOM, updateSidebarStats } from './battleshipFunctions.js';

function main() {
    let startButton = document.querySelector('#start-game-btn');
    let backToProfileBtn = document.querySelector('#back-to-profile-btn');

    startButton.addEventListener('click', function () {
        let sizeSelector = document.querySelector('#grid-size');
        let selectedSize = Number(sizeSelector.value);
// הכנסת כמות הספינות בכל גודל שהמשתמש הכניס 
        let count2 = Number(document.querySelector('#ship-size-2').value);
        let count3 = Number(document.querySelector('#ship-size-3').value);
        let count4 = Number(document.querySelector('#ship-size-4').value);
        let count5 = Number(document.querySelector('#ship-size-5').value);

        if (count2 === 0 && count3 === 0 && count4 === 0 && count5 === 0) {
            Swal.fire({
                title: 'אופס, משהו לא תקין!',
                text: 'עליך לבחור לפחות ספינה אחת כדי להתחיל.',
                icon: 'error',
                confirmButtonText: 'הבנתי, אתקן',
                confirmButtonColor: '#d33',
                backdrop: `rgba(0,0,0,0.4)`
            });
            return;
        }
        // עדכון גודל הלוח לפי מה שהמשתמש בחר 
        setCurrentBoardSize(selectedSize);
// איגוד של כל הספינות שהמשתמש הכניס למשתנה אחד כדי להעביר לפונקציה שמייצרת את הספינות
        let shipsConfiguration = {
            2: count2,
            3: count3,
            4: count4,
            5: count5
        };

        initBoardMatrix(selectedSize);
        generateRandomShips(shipsConfiguration);
//מעבר מהגדרות המשחק למשחק עצמו 
        document.querySelector('#setup-container').classList.add('hidden');
        document.querySelector('#game-container').classList.remove('hidden');

        drawGridDOM();
        updateSidebarStats();
    });

    if (backToProfileBtn) {
        backToProfileBtn.addEventListener('click', function () {
            window.location.href = 'profile.html';
        });
    }
}

main();