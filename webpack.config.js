
const isProd = process.argv.indexOf('-p') !== -1;

module.exports = {
  devtool: 'source-map',
  entry: './src/main.js',
  output: {
    filename: isProd ? 'bindery.min.js' : 'bindery.js',
    libraryTarget: "var",
    library: "Bindery",
    path: __dirname + "/build/",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: [
            ["es2015"]
          ]
        }
      },
      {
          test: /\.svg/,
          loader: 'svg-url-loader',
          options: {}
      }

    ]
  }
}
