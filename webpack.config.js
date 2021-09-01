// @ts-nocheck

'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
module.exports = [
  {
    target: 'web',
    entry: './libs/qr-scanner.js',
    output: {
      path: path.resolve(__dirname, 'dist/scripts'),
      filename: 'qr-scanner.min.js',
      libraryTarget: 'umd'
    }
  }
];