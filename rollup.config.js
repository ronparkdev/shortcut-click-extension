// import dynamicImportVars from '@rollup/plugin-dynamic-import-vars'
import replace from '@rollup/plugin-replace'
import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
// import terser from '@rollup/plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { defineConfig } from 'rollup'
import del from 'rollup-plugin-delete'

export default [
  defineConfig({
    input: ['./src/background.ts', './src/content.tsx', './src/popup.tsx', './src/options.tsx'],
    output: {
      dir: 'dist',
      format: 'esm',
      chunkFileNames: 'chunks/[name]-[hash].js',
      sourcemap: true,
    },
    onwarn(warning, warn) {
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
        return
      }
      warn(warning)
    },
    plugins: [
      del({ targets: 'dist', runOnce: true }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
      typescript(),
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }),
      nodeResolve(),
      commonjs(),
      // dynamicImportVars(), // 이 플러그인은 동적 import를 다루는 것이므로 필요에 따라 배치
      // terser(),
    ],
  }),
]
