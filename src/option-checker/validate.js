const validate = (opts, validOpts) => {
  if (!validOpts) throw Error('Valid options not specified');

  let isValid = true;
  Object.keys(opts).forEach((k) => {
    if (!validOpts[k]) {
      const setName = validOpts.name ? `'${validOpts.name}'` : 'This option';
      console.error(`Unknown Option: ${setName} doesn't expect a property '${k}'`);
      isValid = false;
    } else {
      const val = opts[k];
      const type = validOpts[k];
      if (!type.check(val)) {
        const optName = validOpts.name ? `${validOpts.name}.${k}` : k;
        console.error(`Invalid Option: ${JSON.stringify(val)} is not a valid value for property '${optName}: ${type.name}'`);
        isValid = false;
      }
    }
  });
  return isValid;
};

export default validate;
