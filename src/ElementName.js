let prettyName = (node) => `"${node.tagName.toLowerCase()}${node.id ? `#${node.id}` : ""}.${[...node.classList].join(".")}"`;

module.exports = prettyName;
