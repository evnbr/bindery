export default class BinderyRule {
  constructor(options) {
    options = options || {};
    this.name = options.name ? options.name : 'Unnamed Bindery Rule';
    this.selector = '';

    for (const key in options) {
      this[key] = options[key];
    }
  }
}
