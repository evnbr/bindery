const WebpackAutoInject = require('webpack-auto-inject-version');

const isProd = process.argv.indexOf('-p') !== -1;

module.exports = {
  devtool: 'source-map',
  entry: './src/main.js',
  output: {
    filename: isProd ? 'bindery.min.js' : 'bindery.js',
    libraryTarget: 'var',
    library: 'Bindery',
    path: `${__dirname}/build/`,
  },
  plugins: [
    new WebpackAutoInject({
      components: {
        AutoIncreaseVersion: false,
      },
      componentsOptions: {
        InjectAsComment: {
          tag: 'Build version: {version} - {date}', // default
        },
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['es2015'],
            ],
          },
        },
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-url-loader',
          },
          {
            loader: 'svgo-loader',
            options: {
              plugins: [
                { removeTitle: true },
                { convertColors: { shorthex: false } },
                { convertPathData: false },
              ],
            },
          },
        ],
      },
    ],
  },
};
