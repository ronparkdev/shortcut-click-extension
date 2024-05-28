import replace from '@rollup/plugin-replace'
import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

const makeConfig = (inputFile, outputFile) => ({
  input: inputFile,
  output: {
    file: outputFile,
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      presets: [
        // "@babel/preset-env",
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    typescript(),
    nodeResolve(),
    commonjs(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
    }),
    terser(),
  ],
})

export default [
  makeConfig('./src/background.ts', './dist/background.js'),
  makeConfig('./src/content.tsx', './dist/content.js'),
  makeConfig('./src/settings.tsx', './dist/settings.js'),
]
