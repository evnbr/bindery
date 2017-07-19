let elementToString = (node) => {
  let tag = node.tagName.toLowerCase();
  let id = node.id ? `#${node.id}` : "";

  let classes = "";
  if (node.classList.length > 0) {
    let classes = "." +[...node.classList].join(".");
  }

  let text = "";
  if (id.length < 1 && classes.length < 2) {
    text = `("${ node.textContent.substr(0, 20).replace(/\s+/g, " ") }...")`
  }
  return tag + id + classes + text;
}

export default elementToString;
