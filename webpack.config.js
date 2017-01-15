
module.exports = {
  entry: './app/bindery.js',
  output: {
    filename: 'bundle.js',
    libraryTarget: "var",
    library: "Bindery",
    path: './dist'
  }
}
