const isTextNode = node => node.nodeType === Node.TEXT_NODE;
const isElement = node => node.nodeType === Node.ELEMENT_NODE;
const isScript = node => node.tagName === 'SCRIPT';
const isImage = node => node.tagName === 'IMG';
const isUnloadedImage = node => isImage(node) && !node.naturalWidth;
const isContent = node => isElement(node) && !isScript(node);

export { isTextNode, isElement, isContent, isUnloadedImage };
