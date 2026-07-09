// פונקציות עזר להצגה והסתרה של שגיאות במסכים
function showError(errorElement, message) {
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearError(errorElement) {
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}