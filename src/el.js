let el = (type, className) => {
  let element = document.createElement(type);
  element.classList.add(className);
  return element;
}

module.exports = el;
