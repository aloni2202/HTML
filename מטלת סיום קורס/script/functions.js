class User {
    constructor({ username, password, firstName, lastName, email, dateOfBirth, city, street, houseNumber, profileImage }) {
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.dateOfBirth = dateOfBirth;
        this.city = city;
        this.street = street;
        this.houseNumber = houseNumber;
        this.profileImage = profileImage;
    }
}

function getAllUsers() {
    const storedUsers = localStorage.getItem('users');
    if (!storedUsers) {
        return [];
    }

    try {
        const users = JSON.parse(storedUsers);
        return Array.isArray(users) ? users : [];
    } catch (error) {
        return [];
    }
}

function validatePassword(password) {
    if (typeof password !== 'string') {
        return false;
    }

    const lengthValid = password.length >= 7 && password.length <= 12;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    return lengthValid && hasUppercase && hasNumber && hasSpecialChar;
}

function validateAge(birthDateString) {
    if (typeof birthDateString !== 'string') {
        return false;
    }

    const birthDate = new Date(birthDateString);
    if (Number.isNaN(birthDate.getTime())) {
        return false;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age -= 1;
    }

    return age > 0 && age < 120;
}

function validateEmailFormat(email) {
    if (typeof email !== 'string') {
        return false;
    }

    const atIndex = email.indexOf('@');
    const lastAtIndex = email.lastIndexOf('@');
    const endsWithCom = email.endsWith('.com');

    return atIndex > 0 && atIndex === lastAtIndex && endsWithCom;
}

export { User, getAllUsers, validatePassword, validateAge, validateEmailFormat };