export function plus(a, b) {
    return a + b;
}
export function minus(a, b) {
    return a - b;
}
export function multi(a, b) {
    return a * b;
}
export function partial(a, b) {
    if (b === 0)
        return "אי אפשר לחלק ב-- 0";
    return a / b;
}