let el = (type, className) => {
  element = document.createElement(type);
  element.classList.add(className);
  return element;
}

module.exports = el;
