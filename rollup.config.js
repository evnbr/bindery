import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import minify from 'rollup-plugin-babel-minify';

import sass from 'rollup-plugin-sass';
import postcss from 'postcss';
import prefixer from 'postcss-class-prefix';
import cssnano from 'cssnano';

import pkg from './package.json';


const extend = (a, b) => Object.assign({}, a, b);

const baseConfig = {
  input: 'src/index.js',
};

const baseOutput = {
  name: 'Bindery',
  intro: `const BINDERY_VERSION = 'v${pkg.version}'`,
  banner: `/* 📖 Bindery v${pkg.version} */`,
};

const sassPlugin = () => sass({
  insert: true,
  processor: css => postcss([
    prefixer('📖-'),
    cssnano({ reduceIdents: false }),
  ]).process(css).then(result => result.css),
});

export default [
  // browser-friendly UMD build
  extend(baseConfig, {
    output: extend(baseOutput, {
      file: pkg.browser,
      format: 'umd',
      sourcemap: true,
    }),
    plugins: [
      resolve(),
      commonjs(),
      sassPlugin(),
    ],
  }),

  // minified browser-friendly build
  extend(baseConfig, {
    output: extend(baseOutput, {
      file: 'dist/bindery.min.js',
      format: 'iife',
      sourcemap: true,
    }),
    plugins: [
      resolve(),
      commonjs(),
      sassPlugin(),
      minify({
        comments: false,
      }),
    ],
  }),

  // CommonJS (for Node) and ES module (for bundlers) build.
  extend(baseConfig, {
    external: ['hyperscript'],
    output: [
      extend(baseOutput, { file: pkg.main, format: 'cjs' }),
      extend(baseOutput, { file: pkg.module, format: 'es' }),
    ],
    plugins: [
      resolve(),
      sassPlugin(),
    ],
  }),
];
