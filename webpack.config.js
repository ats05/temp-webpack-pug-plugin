const path = require('path');

const SOURCE_DIR = path.resolve(__dirname, 'src');
const OUTPUT_DIR = path.resolve(__dirname, 'dist');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const PugStyleKitWebpackPlugin = require('./PugStyleKitWebpackPlugin');

module.exports = {
  entry: SOURCE_DIR + '/entry.js',
  output: {
    filename: 'build.js',
    path: OUTPUT_DIR
  },
  devServer: {
    contentBase: OUTPUT_DIR,
    port: 8080
  },
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: {
          loader: 'pug-loader',
        }
      }
    ]
  },
  plugins: [
    new PugStyleKitWebpackPlugin(
      {
        target: [
          {
            from: SOURCE_DIR + '/parse-test.pug',
            to: {
              html: OUTPUT_DIR + '/parse-test.html',
              css: OUTPUT_DIR + '/style.css',
            },
          }
        ],
      }
    ),
  ]
};
