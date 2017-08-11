export default class Rule {
  constructor(options) {
    this.name = options.name ? options.name : 'Unnamed Bindery Rule';
    this.selector = '';

    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }

  validate(opts, validOpts) {
    Object.keys(opts).forEach((k) => {
      if (!validOpts[k]) {
        console.error(`Bindery: '${this.name}' doesn't have an option '${k}'`);
      } else {
        const val = opts[k];
        if (!validOpts[k](val)) {
          console.error(`Bindery: In '${this.name}', '${val}' is not a valid value for '${k}'`);
        }
      }
    });
  }
}
