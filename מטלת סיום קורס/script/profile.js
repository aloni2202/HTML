document.addEventListener("DOMContentLoaded", () => {
    const sessionData = sessionStorage.getItem("currentUser");

    if (!sessionData) {
        alert("גישה חסומה! אנא התחבר קודם.");
        window.location.href = "index.html"; // תוקן ל-index.html
        return;
    }

    const currentUser = JSON.parse(sessionData);

    document.getElementById("displayFullName").textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById("displayUsername").textContent = `${currentUser.username}`;
    document.getElementById("displayEmail").textContent = currentUser.email;
    document.getElementById("displayCity").textContent = currentUser.city;
    document.getElementById("displayAddress").textContent = `רחוב ${currentUser.street} ${currentUser.houseNumber}`;
    
    const date = new Date(currentUser.dateOfBirth);
    document.getElementById("displayBirthDate").textContent = date.toLocaleDateString('he-IL');

    if (currentUser.profileImage) {
        document.getElementById("displayImage").src = currentUser.profileImage;
    } else {
        document.getElementById("displayImage").src = "https://via.placeholder.com/150";
    }

    document.getElementById("logoutBtn").addEventListener("click", () => {
        sessionStorage.removeItem("currentUser");
        window.location.href = "index.html"; 
    });
});