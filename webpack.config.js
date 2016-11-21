module.exports = {
    context: __dirname + '/src',
    entry: __dirname + '/src/MyBot.js',
    target: 'node',
    output: {
        path: __dirname + '/dist',
        filename: 'MyBot.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|dist)/,
                loader: 'babel'
            }
        ],
    },
    watch: true,
    devtool: 'inline-source-map',
}