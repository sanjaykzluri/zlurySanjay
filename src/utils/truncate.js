/**
 * Truncate text by number of characters.
 * @param {*} str => string to truncate
 * @param {*} num => number of characters string should have
 * @param {*} postfix => string to add at the end of the str eg=> '...' 
 * @returns 
 */
export function truncate(str, num, postfix) {
    return (str.length > num) ? str.substr(0, num - 1) + postfix : str
}