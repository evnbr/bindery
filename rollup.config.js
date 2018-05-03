import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import minify from 'rollup-plugin-babel-minify';

import sass from 'rollup-plugin-sass';
import postcss from 'postcss';
import cssnano from 'cssnano';
import inlinesvg from 'postcss-svg';

import pkg from './package.json';


const baseConfig = {
  entry: 'src/index.js',
  moduleName: 'Bindery',
  intro: `const BINDERY_VERSION = 'v${pkg.version}'`,
  banner: `/* 📖 Bindery v${pkg.version} */`,
};

const sassPlugin = () => sass({
  insert: true,
  processor: css => postcss([
    inlinesvg({
      func: 'url',
      dirs: './src',
      svgo: { plugins: [
        { cleanupAttrs: true },
        { removeTitle: true },
      ] },
    }),
    cssnano({
      reduceIdents: false,
    }),
  ])
    .process(css)
    .then(result => result.css),
});

export default [
  // browser-friendly UMD build
  Object.assign({}, baseConfig, {
    dest: pkg.browser,
    format: 'umd',
    sourceMap: true,
    plugins: [
      resolve(),
      commonjs(),
      sassPlugin(),
    ],
  }),

  // minified browser-friendly build
  Object.assign({}, baseConfig, {
    dest: 'dist/bindery.min.js',
    format: 'iife',
    sourceMap: true,
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
  Object.assign({}, baseConfig, {
    external: ['hyperscript'],
    targets: [
      { dest: pkg.main, format: 'cjs' },
      { dest: pkg.module, format: 'es' },
    ],
    plugins: [
      resolve(),
      sassPlugin(),
    ],
  }),
];
