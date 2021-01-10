import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

import sass from 'rollup-plugin-sass';
import postcss from 'postcss';
import prefixer from 'postcss-class-prefix';
import cssnano from 'cssnano';

import pkg from './package.json';

const extend = (a, b) => ({ ...a, ...b });

const classPrefix = '📖-';

const baseConfig = {
  input: 'build/index.js',
};

const baseOutput = {
  name: 'Bindery',
  intro: `
const BINDERY_VERSION = 'v${pkg.version}';
const BINDERY_CLASS_PREFIX = '${classPrefix}';
  `,
  banner: `/* 📖 Bindery v${pkg.version} */`,
};

const sassPlugin = ({ shouldMinify } = {}) => sass({
  insert: true,
  processor: (css) =>
    postcss(
      shouldMinify
        ? [prefixer(classPrefix), cssnano()]
        : [prefixer(classPrefix)],
    )
      .process(css)
      .then(result => result.css),
});

// browser-friendly UMD build
const umd = extend(baseConfig, {
  output: extend(baseOutput, {
    file: pkg.browser,
    format: 'umd',
    sourcemap: true,
  }),
  plugins: [resolve(), commonjs(), sassPlugin()],
});

// minified browser-friendly build
const mini = extend(baseConfig, {
  output: extend(baseOutput, {
    file: 'dist/bindery.min.js',
    format: 'iife',
    sourcemap: true,
  }),
  plugins: [
    resolve(),
    commonjs(),
    sassPlugin({ shouldMinify: true }),
    terser({
      ecma: 2018,
    }),
  ],
});

// CommonJS (for Node) and ES module (for bundlers) build.
const modules = extend(baseConfig, {
  output: [
    extend(baseOutput, { file: pkg.main, format: 'cjs' }),
    extend(baseOutput, { file: pkg.module, format: 'es' }),
  ],
  external: ['regionize'],
  plugins: [resolve(), sassPlugin()],
});

const outputs = process.env.BUILD === 'prod' ? [umd, mini, modules] : umd;

export default outputs;
