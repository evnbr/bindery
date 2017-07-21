const elementToString = (node) => {
  const tag = node.tagName.toLowerCase();
  const id = node.id ? `#${node.id}` : '';

  let classes = '';
  if (node.classList.length > 0) {
    classes = `.${[...node.classList].join('.')}`;
  }

  let text = '';
  if (id.length < 1 && classes.length < 2) {
    text = `("${node.textContent.substr(0, 20).replace(/\s+/g, ' ')}...")`;
  }
  return tag + id + classes + text;
};

export default elementToString;
