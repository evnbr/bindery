const prefix = str => `bindery-${str}`;
const prefixClass = str => `.${prefix(str)}`;

export { prefix, prefixClass };
