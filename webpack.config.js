var ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  devtool: 'eval',
  entry: './libs/client/app-client.js',
  output: {
    path: __dirname + '/public/dist',
    filename: 'bundle.js',
    publicPath: '/dist/'
  },
  plugins: [
    new ExtractTextPlugin('style.css', { allChunks: true })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel?presets[]=es2015&presets[]=react',
        exclude: /node_modules/
      },
      { test: /\.(gif|png|jpg)$/, loader: 'url?limit=25000' },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css!autoprefixer') }
    ]
  }
};
