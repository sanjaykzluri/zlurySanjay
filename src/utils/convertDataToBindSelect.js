export function convertObjToBindSelect(obj) {
    let res = [];
    for (const prop in obj) {
        res.push({ label: prop, value: obj[prop] })
    }
    return res;
}


export function convertArrayToBindSelect(arr, postLabelStr='') {
   return arr.map(i => { return { label: `${i} ${postLabelStr}`, value: i } })
}


