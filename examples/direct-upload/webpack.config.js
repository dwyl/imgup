module.exports = {
  entry: './generate-keys.js',
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.json$/, exclude: /node_modules/, loader: 'json' }
    ]
  }
}
