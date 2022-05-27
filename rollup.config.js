import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import pkg from './package.json';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'playground/src/grid/index.js',
        format: 'esm',
        banner: '/* eslint-disable */',
      },
      { file: pkg.main, format: 'cjs' },
    ],
    plugins: [
      del({ targets: ['dist/*', 'playground/src/grid'] }),
      typescript(),
    ],
    external: Object.keys(pkg.peerDependencies || {}),
  },
];
