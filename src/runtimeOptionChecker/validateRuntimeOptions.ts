interface OptionSet {
  name?: string;
  [key: string]: any;
}

const validateRuntimeOptions = (opts: OptionSet, validOpts: OptionSet) => {
  if (!validOpts) throw Error('Valid options not specified');

  Object.keys(opts).forEach(k => {
    if (!validOpts[k]) {
      const setName = validOpts.name ?? 'This option';
      throw Error(`Unknown option in ${setName}: '${k}'`);
    }
    const val = opts[k];
    const type = validOpts[k];
    if (!type.check(val)) {
      const optName = validOpts.name ? `${validOpts.name}.${k}` : k;
      const valName = JSON.stringify(val);
      throw Error(
        `Invalid value for '${optName}': ${valName} is not a ${type.name}.`,
      );
    }
  });
  return true;
};

export default validateRuntimeOptions;
