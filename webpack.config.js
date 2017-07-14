
const isProd = process.argv.indexOf('-p') !== -1;

module.exports = {
  devtool: 'source-map',
  entry: './src/main.js',
  output: {
    filename: isProd ? 'bindery.min.js' : 'bindery.js',
    libraryTarget: "var",
    library: "Bindery",
    path: "./build/",
  },
  loaders: [
    {
      test: /\.css$/,
      loader: "style-loader!css-loader"
    }
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
    ]
  }
}
