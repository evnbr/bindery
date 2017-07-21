export default class BinderyRule {
  constructor(options = {}) {
    this.name = options.name ? options.name : 'Unnamed Bindery Rule';
    this.selector = '';

    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}
