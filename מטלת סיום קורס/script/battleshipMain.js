import { initBoardMatrix, generateRandomShips, drawGridDOM, updateSidebarStats } from './battleshipFunctions.js';

function main() {
    let startButton = document.querySelector('#start-game-btn');
    
    startButton.addEventListener('click', function() {
        let sizeSelector = document.querySelector('#grid-size');
        let selectedSize = Number(sizeSelector.value);

        let count2 = Number(document.querySelector('#ship-size-2').value);
        let count3 = Number(document.querySelector('#ship-size-3').value);
        let count4 = Number(document.querySelector('#ship-size-4').value);
        let count5 = Number(document.querySelector('#ship-size-5').value);

        if (count2 === 0 && count3 === 0 && count4 === 0 && count5 === 0) {
            alert('שגיאה: חסרים נתונים. עליך לבחור לפחות ספינה אחת כדי להתחיל.');
            return;
        }

        let shipsConfiguration = {
            2: count2,
            3: count3,
            4: count4,
            5: count5
        };

        // קורא לפונקציית האתחול ומעביר לה את הגודל הנבחר
        initBoardMatrix(selectedSize);
        generateRandomShips(shipsConfiguration);

        document.querySelector('#setup-container').style.display = 'none';
        document.querySelector('#game-container').style.display = 'flex';

        drawGridDOM();
        updateSidebarStats();
    });
}

main();