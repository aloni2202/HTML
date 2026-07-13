export let boardMatrix = [];
export let currentBoardSize = 10;
export let shipsStatusList = [];

// פונקציה שמאפשרת לשנות את הגודל מתוך הקובץ שבו המשתנה הוגדר
export function updateBoardSizeInVars(size) {
    currentBoardSize = size;
}