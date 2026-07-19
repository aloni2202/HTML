import { boardMatrix, currentBoardSize, shipsStatusList, updateBoardSizeInVars } from './battleshipVars.js';

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

function checkPlacementValid(row, col, shipSize, isVertical) {
    if (isVertical) {
        if (row + shipSize > currentBoardSize) return false;
    } else {
        if (col + shipSize > currentBoardSize) return false;
    }

    let startRow = row - 1;
    if (startRow < 0) startRow = 0;

    let endRow = isVertical ? (row + shipSize) : (row + 1);
    if (endRow > currentBoardSize - 1) endRow = currentBoardSize - 1;

    let startCol = col - 1;
    if (startCol < 0) startCol = 0;

    let endCol = isVertical ? (col + 1) : (col + shipSize);
    if (endCol > currentBoardSize - 1) endCol = currentBoardSize - 1;

    // תיקון תנאי הלולאות המקוננות למניעת תקיעה של הדפדפן
    for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
            if (boardMatrix[r][c].hasShip === true) {
                return false;
            }
        }
    }
    return true;
}


export function generateRandomShips(shipCounts) {
    let shipIdCounter = 0;
    shipsStatusList.length = 0;

    for (let size = 5; size >= 2; size--) {
        let amountToPlace = shipCounts[size];

        for (let count = 0; count < amountToPlace; count++) {
            let isPlaced = false;
            let attempts = 0;

            while (isPlaced === false && attempts < 1000) {
                let isVertical = Math.random() >= 0.5;
                let randomRow = Math.floor(Math.random() * currentBoardSize);
                let randomCol = Math.floor(Math.random() * currentBoardSize);

                if (checkPlacementValid(randomRow, randomCol, size, isVertical) === true) {
                    let newShip = {
                        id: shipIdCounter,
                        size: size,
                        hitsCount: 0,
                        isSunk: false
                    };
                    shipsStatusList.push(newShip);

                    for (let i = 0; i < size; i++) {
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

export function drawGridDOM() {
    let gridContainer = document.querySelector('#board-grid');
    gridContainer.innerHTML = '';

    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = `repeat(${currentBoardSize}, 40px)`;
    gridContainer.style.gap = '2px';

    for (let r = 0; r < currentBoardSize; r++) {
        for (let c = 0; c < currentBoardSize; c++) {
            let gridCell = document.createElement('div');

            gridCell.style.width = '40px';
            gridCell.style.height = '40px';
            gridCell.style.backgroundColor = 'gray';
            gridCell.style.cursor = 'pointer';

            gridCell.setAttribute('data-row', r);
            gridCell.setAttribute('data-col', c);

            gridCell.addEventListener('click', onCellClicked);
            gridContainer.appendChild(gridCell);
        }
    }
}

export function updateSidebarStats() {
    let tableBody = document.querySelector('#ships-table-body');
    tableBody.innerHTML = '';

    let sizeCounters = { 2: 0, 3: 0, 4: 0, 5: 0 };
    for (let i = 0; i < shipsStatusList.length; i++) {

        if (shipsStatusList[i].isSunk === false) {
            let shipSize = shipsStatusList[i].size;
            sizeCounters[shipSize]++;
        }
    }


    for (let size = 2; size <= 5; size++) {
        let row = document.createElement('tr');

        let nameCell = document.createElement('td');
        nameCell.innerText = `ספינה בגודל ${size}`;
        nameCell.style.padding = '6px';
        nameCell.style.border = '1px solid black';

        let countCell = document.createElement('td');
        countCell.innerText = sizeCounters[size];
        countCell.style.padding = '6px';
        countCell.style.border = '1px solid black';

        row.appendChild(nameCell);
        row.appendChild(countCell);
        tableBody.appendChild(row);
    }
}

function onCellClicked(event) {
    let clickedCell = event.target;
    let row = Number(clickedCell.getAttribute('data-row'));
    let col = Number(clickedCell.getAttribute('data-col'));

    let cellData = boardMatrix[row][col];

    if (cellData.isHit === true) {
        return;
    }
    cellData.isHit = true;

    clickedCell.style.display = 'flex';
    clickedCell.style.alignItems = 'center';
    clickedCell.style.justifyContent = 'center';
    clickedCell.style.fontSize = '1.5rem';

    if (cellData.hasShip === true) {
        clickedCell.style.backgroundColor = 'orange';
        clickedCell.innerText = '🚢';

        let hitShip = null;
        for (let i = 0; i < shipsStatusList.length; i++) {
            if (shipsStatusList[i].id === cellData.shipId) {
                hitShip = shipsStatusList[i];
            }
        }

        hitShip.hitsCount++;

        if (hitShip.hitsCount === hitShip.size) {
            hitShip.isSunk = true;
            updateSidebarStats();
            triggerExplosionEffects();
        }
    } else {
        clickedCell.style.backgroundColor = 'blue';
        clickedCell.innerText = '🌊';
    }
}

function triggerExplosionEffects() {

    let explosionSound = new Audio('style/explosion.mp3');
    explosionSound.volume = 0.5;
    explosionSound.play().catch(function (error) {
        console.log("הדפדפן חסם אודיו אוטומטי:", error);
    });


    let tableBody = document.querySelector('#ships-table-body');
    let logRow = document.createElement('tr');
    logRow.style.backgroundColor = '#ffe6e6';

    let logCell = document.createElement('td');
    logCell.setAttribute('colspan', '2');
    logCell.innerText = '💥 ספינה הושמדה לחלוטין!';
    logCell.style.padding = '8px';
    logCell.style.textAlign = 'center';
    logCell.style.color = 'red';
    logCell.style.fontWeight = 'bold';
    logCell.style.border = '1px solid black';

    logRow.appendChild(logCell);
    tableBody.appendChild(logRow);

    let boomNotification = document.createElement('div');
    boomNotification.innerText = '💥 BOOM! 💥';
    boomNotification.style.position = 'fixed';
    boomNotification.style.top = '50%';
    boomNotification.style.left = '50%';
    boomNotification.style.transform = 'translate(-50%, -50%)';
    boomNotification.style.fontSize = '5rem';
    boomNotification.style.fontWeight = 'bold';
    boomNotification.style.color = 'red';
    boomNotification.style.textShadow = '3px 3px 10px black';
    boomNotification.style.zIndex = '9999';
    document.body.appendChild(boomNotification);


    setTimeout(function () {
        boomNotification.remove();
        checkGameStatus();
    }, 2000);
}

function checkGameStatus() {
    let winGame = true;
    for (let i = 0; i < shipsStatusList.length; i++) {
        if (shipsStatusList[i].isSunk === false) {
            winGame = false;
        }
    }

    if (winGame === true && shipsStatusList.length > 0) {
        alert('כל הכבוד! השמדת את כל ספינות האויב וניצחת במשחק!');
    }
}