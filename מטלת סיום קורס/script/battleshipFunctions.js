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

    let startRow = row - 1 < 0 ? 0 : row - 1;
    let endRow = isVertical ? (row + shipSize) : (row + 1);
    if (endRow > currentBoardSize - 1) endRow = currentBoardSize - 1;

    let startCol = col - 1 < 0 ? 0 : col - 1;
    let endCol = isVertical ? (col + 1) : (col + shipSize);
    if (endCol > currentBoardSize - 1) endCol = currentBoardSize - 1;

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

    gridContainer.style.setProperty('--board-size', currentBoardSize);

    for (let r = 0; r < currentBoardSize; r++) {
        for (let c = 0; c < currentBoardSize; c++) {
            let gridCell = document.createElement('div');
            gridCell.classList.add('grid-cell');

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

        let countCell = document.createElement('td');
        countCell.innerText = sizeCounters[size];

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
    clickedCell.classList.add('revealed');

    if (cellData.hasShip === true) {
        clickedCell.classList.add('hit');
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
        clickedCell.classList.add('miss');
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