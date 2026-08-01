import { boardMatrix, currentBoardSize, shipsStatusList, updateBoardSizeInVars } from './battleshipVars.js';

//בניה ורענון של מטריצת הלוח בזיכרון לפי הגודל שהמשתמש בחר
//הלוח נבנה ריק וחלק מספינות, נטו ים בעצם
export function initBoardMatrix(size) {
    updateBoardSizeInVars(size);
    boardMatrix.length = 0;
    for (let i = 0; i < size; i++) {
        let row = [];
        for (let j = 0; j < size; j++) {
            let cellObject = {
                hasShip: false,
                shipId: -1,
                isHit: false
            };
            row.push(cellObject);
        }
        boardMatrix.push(row);
    }
}
// פונקציה עזר שמודדת שהספינות לא חורגות מגבולות הלוח
// ושומרת על מרווח של משבצת אחת מכל הכיוונים מספינות אחרות
//היא רק בודקת את המיקומים לא במגדירה, אם המיקום חוקי היא מחזירה אמת ואחרת שקר
function checkPlacementValid(row, col, shipSize, isVertical) {
    if (isVertical) {  //מיקום אנכי
        if (row + shipSize > currentBoardSize) return false; //אם חורגת מחזירה שקר
    } else { //מיקום אופקי
        if (col + shipSize > currentBoardSize) return false; //אם חורגת מחזירה שקר
    }

    let startRow = row - 1 < 0 ? 0 : row - 1;
    let endRow = isVertical ? (row + shipSize) : (row + 1);
    if (endRow > currentBoardSize - 1) endRow = currentBoardSize - 1;

    let startCol = col - 1 < 0 ? 0 : col - 1;
    let endCol = isVertical ? (col + 1) : (col + shipSize);
    if (endCol > currentBoardSize - 1) endCol = currentBoardSize - 1;

    for (let r = startRow; r <= endRow; r++) { //לולאה על כל התאים במסגרת של הספינה
        for (let c = startCol; c <= endCol; c++) {
            if (boardMatrix[r][c].hasShip === true) { // אם כל התאים במסגרת פנויים מחזירה אמת
                return false; // אם לא פנויים מחזירה שקר
            }
        }
    }
    return true;
}
// מכניסים את הספינות פיזית ללוח בזיכרון
export function generateRandomShips(shipCounts) {
    let shipIdCounter = 0;
    shipsStatusList.length = 0;

    for (let size = 5; size >= 2; size--) { //הלולאה רצה מספינה בגודל 5 קודם כי יותר קשה למצוא לה מקום עד לספינה בגודל 2
        let amountToPlace = shipCounts[size]; // מספר הספינות מאותו הגודל שהמשתמש בחר

        for (let count = 0; count < amountToPlace; count++) { // לולאה שמניחה בדיוק את כמות הספינות הנדרשות מהגודל הזה 
            let isPlaced = false;
            let attempts = 0;

            while (isPlaced === false && attempts < 1000) { //הגרלת מיקומים, נותנת מיקום אקראי
                let isVertical = Math.random() >= 0.5;
                let randomRow = Math.floor(Math.random() * currentBoardSize);
                let randomCol = Math.floor(Math.random() * currentBoardSize);

                if (checkPlacementValid(randomRow, randomCol, size, isVertical) === true) { //וקוראת לפונקציה מעל לבדוק האם המיקום פנוי ומותר לשימוש
                    let newShip = {
                        id: shipIdCounter,
                        size: size,
                        hitsCount: 0,
                        isSunk: false
                    };
                    shipsStatusList.push(newShip); // יצירת אובייקט ספינה חדש ושמירה ברשימת הספינות

                    for (let i = 0; i < size; i++) { //לולאה שאחראית לשמירת הנתונים של הספינה, המיקום האמיתי והסופי שלה הזיכרון
                        let r = isVertical ? (randomRow + i) : randomRow;
                        let c = isVertical ? randomCol : (randomCol + i);
                        boardMatrix[r][c].hasShip = true;
                        boardMatrix[r][c].shipId = shipIdCounter;
                    }

                    shipIdCounter++;
                    isPlaced = true;
                }
                attempts++;
            }
        }
    }
}

export function drawGridDOM() { //תרגום של הלוח מהזיכרון לרשת ריבועים פיזית על המסך של המשתמש 
    let gridContainer = document.querySelector('#board-grid');
    gridContainer.innerHTML = '';

    gridContainer.style.setProperty('--board-size', currentBoardSize);

    for (let r = 0; r < currentBoardSize; r++) {
        for (let c = 0; c < currentBoardSize; c++) {
            let gridCell = document.createElement('div');
            gridCell.classList.add('grid-cell');

            gridCell.setAttribute('data-row', r); // שמירת הנתונים של השורה והעמודה של כל משבצת בריבוע עצמו, כדי שנוכל לדעת איזה ריבוע נלחץ
            gridCell.setAttribute('data-col', c);

            gridCell.addEventListener('click', onCellClicked); //הוספת מאזין לאירוע לחיצה על כל משבצת בריבוע, כדי שנוכל לדעת איזה ריבוע נלחץ
            gridContainer.appendChild(gridCell);
        }
    }
}
//אחראית לספירת הספינות הנותרות בבר בצד 
export function updateSidebarStats() {
    let tableBody = document.querySelector('#ships-table-body');
    tableBody.innerHTML = '';  //איפוס הטבלה

    let sizeCounters = { 2: 0, 3: 0, 4: 0, 5: 0 }; //איפוס מונה הספינות שנותרו מכל סוג
    for (let i = 0; i < shipsStatusList.length; i++) { //ספירת ספינות פעילות שנותרו 
        if (shipsStatusList[i].isSunk === false) {
            let shipSize = shipsStatusList[i].size;
            sizeCounters[shipSize]++;
        }
    }

    for (let size = 2; size <= 5; size++) { // בניית הטבלה לחישוב ספינות נותרות  
        let row = document.createElement('tr');

        let nameCell = document.createElement('td');
        nameCell.innerText = `ספינה בגודל ${size}`;

        let countCell = document.createElement('td');
        countCell.innerText = sizeCounters[size];

        row.appendChild(nameCell);
        row.appendChild(countCell);
        tableBody.appendChild(row);
    }
}
//ניהול לחיצה של המשתמש על משבצת בלוח 
function onCellClicked(event) { 
    let clickedCell = event.target;
    let row = Number(clickedCell.getAttribute('data-row'));
    let col = Number(clickedCell.getAttribute('data-col'));

    let cellData = boardMatrix[row][col];

    if (cellData.isHit === true) { //מניעת ירייה כפולה
        return; //אם כבר נלחצה המשבצת הפונקציה עוצרת לא ממשיכה 
    }
    cellData.isHit = true; // עדכון בזיכרון שהמשבצת נלחצה  
    clickedCell.classList.add('revealed'); // חשיפה של המשבצת למשתמש

    if (cellData.hasShip === true) { //יש ספינה 
        clickedCell.classList.add('hit');
        clickedCell.innerText = '🚢'; //הצבת אימוגי מתאים 

        let hitShip = null;
        for (let i = 0; i < shipsStatusList.length; i++) { //חיפוש הספינה שנפגעה לפי מזהה הספינה
            if (shipsStatusList[i].id === cellData.shipId) {
                hitShip = shipsStatusList[i];
            }
        }

        hitShip.hitsCount++;

        if (hitShip.hitsCount === hitShip.size) {  // אם כמות הפגיעות שווה לגודל הספיינה, מעדכן את סטטוס הספינה בזיכרון שהיא הוטבעה
            hitShip.isSunk = true;
            updateSidebarStats();
            triggerExplosionEffects();
        }
    } else { //אין ספינה במשבצת 
        clickedCell.classList.add('miss');
        clickedCell.innerText = '🌊'; // הצבת אימוגי מתאים
    }
}
//אחראית על האפקטים מסביב ברגע שספינה טבעה/פוצצה 
function triggerExplosionEffects() { 
    let explosionSound = new Audio('style/explosion.mp3'); // יצירת אובייקט אודיו חדש עבור צליל הפיצוץ
    explosionSound.volume = 0.5;
    explosionSound.play().catch(function (error) {
        console.log("הדפדפן חסם אודיו אוטומטי:", error);
    });

    let tableBody = document.querySelector('#ships-table-body'); 
    let logRow = document.createElement('tr');
    logRow.classList.add('log-row');

    let logCell = document.createElement('td');
    logCell.setAttribute('colspan', '2');
    logCell.innerText = '💥 ספינה הושמדה לחלוטין!'; 
    logCell.classList.add('log-cell');

    logRow.appendChild(logCell);
    tableBody.appendChild(logRow);

    let boomNotification = document.createElement('div');
    boomNotification.innerText = '💥 BOOM! 💥';
    boomNotification.classList.add('boom-banner');
    document.body.appendChild(boomNotification);

    setTimeout(function () {
        boomNotification.remove();
        checkGameStatus();
    }, 2000);
}
// בדיקה בזיכרון אם כל הספינות הוטבעו, אם כן- מוציאה חלונית של ניצחון אם אפשרויות למשתמש איך להמשיך מפה 
function checkGameStatus() {  
    let winGame = true;
    for (let i = 0; i < shipsStatusList.length; i++) {
        if (shipsStatusList[i].isSunk === false) {
            winGame = false;
        }
    }

    if (winGame === true && shipsStatusList.length > 0) {
        Swal.fire({
            title: '🏆 כל הכבוד! ניצחת!',
            text: 'השמדת את כל ספינות האויב בהצלחה!',
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'משחק חדש 🔄',
            cancelButtonText: 'לפרופיל האישי 👤',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#3085d6',
            allowOutsideClick: false,
            backdrop: `rgba(0,0,0,0.4)`
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.reload();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                window.location.href = 'profile.html';
            }
        });
    }
}