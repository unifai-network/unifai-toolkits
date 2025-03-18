export const enumKeys = (enumObject: Object) => Object.keys(enumObject).filter(key => isNaN(Number(key)));
export const enumValues = (enumObject: Object) => Object.values(enumObject).filter(value => typeof value === "number");
