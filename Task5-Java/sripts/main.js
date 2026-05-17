import { plus, minus, multi, partial } from "./function.js";
console.log('Enter 2 nums : ');
let n1 = Number(prompt("הכנס מספר ראשון : "));
let n2 = Number(prompt("הכנס מספר שני : "));
let ans = prompt("הכנס את הפעולה החשבונית הרצויה עבורך (+ , - , * , /)");
switch (ans) {
    case "+":
       let res = plus(n1 , n2);
       alert ("התוצאה היא  :"  + res);
        break;
    case "-":
        let res1 = minus(n1 , n2);
       alert ("התוצאה היא  :"  + res1);
        break;
    case "*":
        let res2 = multi(n1 , n2);
       alert ("התוצאה היא  :"  + res2);
        break;
    case "/":
       let res3 = partial(n1 , n2);
       alert ("התוצאה היא  :"  + res3);
        break;
    default : alert('הפעולה אינה תקינה')    

}
