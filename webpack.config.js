// @ts-nocheck

'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
module.exports = [
  {
    target: 'web',
    entry: './app.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'qr-scanner.min.js',
      libraryTarget: 'umd'
    }
  }
];