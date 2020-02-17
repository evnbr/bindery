const cssNumberRegEx = /^([+-]?[0-9]+(.?[0-9]+)?)(px|in|cm|mm|pt|pc)$/;
const isLength = (str) => cssNumberRegEx.test(str);
const parseLength = (str) => {
    if (!isLength(str))
        throw Error(`Cannot parse css length from "${str}"`);
    const matches = str.match(cssNumberRegEx);
    if (!matches) {
        throw Error(`Failed to parsse css length from "${str}"`);
    }
    return {
        val: Number(matches[1]),
        unit: matches[3],
    };
};
export { parseLength, isLength };
