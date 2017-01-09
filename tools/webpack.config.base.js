var pkg = require('../package.json');
module.exports = {
  entry: [
    // Set up an ES6-ish environment
    // 'babel-polyfill',
    // Add your application's scripts below
    './src/main.js',
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /(bower_components|node_modules|__tests__)/,
      loader: 'babel-loader',
    }],
  },
  output: {
    libraryTarget: 'umd',
    library: pkg.name,
  },
  resolve: {
    extensions: [
      '',
      '.js',
    ],
  },
};
