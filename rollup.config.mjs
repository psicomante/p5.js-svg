import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

export default [
    // unpkg
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/p5.svg.js',
            format: 'iife',
            sourcemap: true,
            name: 'p5svg'
        },
        plugins: [typescript(), resolve(), commonjs()]
    },
    // cjs (webpack, vite)
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/p5.svg.cjs.js',
            format: 'cjs',
            sourcemap: true,
            name: 'p5svg'
        },
        plugins: [resolve(), typescript(), commonjs()]
    },
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/p5.svg.esm.js',
            format: 'esm',
            sourcemap: true
        },
        plugins: [resolve(), typescript(), commonjs()]
    },
    // test
    {
        input: 'test/unit/index.js',
        output: {
            file: 'dist/test.js',
            format: 'iife',
            sourcemap: true,
            name: 'p5svg'
        },
        plugins: [resolve(), commonjs()]
    }
]