import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import bundleSize from 'rollup-plugin-bundle-size';
import json from 'rollup-plugin-json';
import builtins from 'builtin-modules';

export default [
  {
    input: './src/lambda.ts',
    output: {
      file: 'dist/lambda.js',
      format: 'cjs',
      sourcemap: false,
    },

    external: ['aws-sdk', ...builtins],

    plugins: [
      resolve(),
      commonjs(),
      json(),
      typescript({
        compilerOptions: {
          declaration: false,
          declarationMap: false,
          sourceMap: false,
        },
      }),
      terser(),
      bundleSize(),
    ],
  },
  {
    input: './src/index.ts',
    output: [
      {
        file: 'lib/bundle.js',
        format: 'cjs',
        sourcemap: true,
      },
    ],

    plugins: [resolve(), commonjs(), typescript()],

    external: id => {
      return !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0');
    },
  },
];
