import elementName from "./ElementName"

class ElementPath {
  constructor() {
    this.items = [];
  }
  push(item) {
    this.items.push(item);
  }
  pop() {
    return this.items.pop();
  }
  get root() {
    return this.items[0];
  }
  get last(){
    return this.items[this.items.length-1];
  }
  clone() {
    let newPath = new ElementPath();
    for (var i = this.items.length - 1; i >= 0; i--) {
      let clone = this.items[i].cloneNode(false);
      clone.innerHTML = '';
      clone.setAttribute("bindery-continuation", true);
      if (clone.id) {
        console.warn(`Bindery: Added a break to ${elementName(clone)}, so "${clone.id}" is no longer a unique ID.`);
      }
      if (i < this.items.length - 1) clone.appendChild(newPath.items[i+1]);
      newPath.items[i] = clone;
    }
    return newPath;
  }
}

module.exports = ElementPath;
