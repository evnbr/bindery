let el = (selector, text) => {

  let tags = selector.match(/^([a-zA-Z]+)/g);
  let ids = selector.match(/#([a-zA-Z0-9\-\_]+)/g);
  let classes = selector.match(/\.([a-zA-Z0-9\-\_]+)/g);

  let element = document.createElement(tags ? tags[0] : "div");

  if (ids) element.id = ids[0].substr(1);
  if (classes) element.className = classes.map((c) => c.substr(1) ).join(" ");
  if (text) element.textContent = text;

  return element;
}

export default el;
