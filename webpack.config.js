const path = require('path')
// const webpack = require('webpack')

module.exports = {
    entry: {
        index: path.resolve(__dirname, 'src', 'index.js'),
        mvvm: path.resolve(__dirname, 'src', 'mvvm', 'index.js')
    },
    output:{
        path: path.resolve(__dirname, 'src'),
        publicPath: '/',
        filename: '[name].js'
    },
    resolve:{
        extensions: ['.js', '.css', '.json'],
        alias: {}
    },
    module: {
        rules:[
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ['env', 'stage-2']
                }
            }
        ]
    },
    plugins: [
    ],
    devtool: 'eval-source-map',
    devServer: {
        contentBase: path.resolve(__dirname, 'src'),
        port: 9000,
    }
}
