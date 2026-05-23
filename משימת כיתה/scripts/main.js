let grades = [85, 90, 55, 100, 62, 40, 78];

let pass = grades.filter(pass => { return pass >= 60 });
console.log(pass);

let bonus = grades.map(bonus => {
    if (bonus === 100) return bonus;
    else return bonus + 5
});
console.log(bonus);

let avg = bonus.reduce((total, current) => { return total + current }) / bonus.length;
console.log(avg);