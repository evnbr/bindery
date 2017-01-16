
module.exports = {
  devtool: 'source-map',
  entry: './src/main.js',
  output: {
    filename: 'bindery.js',
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
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
    ]
  }
}
