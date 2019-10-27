import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import minify from 'rollup-plugin-babel-minify';
import babel from 'rollup-plugin-babel';

import pkg from './package.json';


const extend = (a, b) => Object.assign({}, a, b);

const baseConfig = {
  input: 'src/index.ts',
};

const baseOutput = {
  name: 'Regionize',
  banner: `/* 📖 Regionize v${pkg.version} */`,
};

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
      typescript(),
    ],
  }),

  // minified browser-friendly build
  extend(baseConfig, {
    output: extend(baseOutput, {
      file: 'dist/regionize.min.js',
      format: 'iife',
      sourcemap: true,
    }),
    plugins: [
      resolve(),
      commonjs(),
      typescript(),
      minify({
        comments: false,
      }),
    ],
  }),

  // CommonJS (for Node)
  extend(baseConfig, {
    output: extend(baseOutput, {
      file: pkg.main,
      format: 'cjs',
    }),
    plugins: [
      resolve(),
      commonjs(),
      typescript(),
      babel({
        runtimeHelpers: true,
        exclude: 'node_modules/**',
      }),
    ],
  }),

  // ES module (for bundlers)
  extend(baseConfig, {
    output: extend(baseOutput, {
      file: pkg.module,
      format: 'es',
    }),
    plugins: [
      resolve(),
      typescript(),
    ],
  }),
];
