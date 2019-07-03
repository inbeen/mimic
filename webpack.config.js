const path = require('path')
const { AutoWebPlugin } = require('web-webpack-plugin')

const autoWebPlugin = new AutoWebPlugin('src', {
    template: './template.html',
    commonsChunk: {
        name: 'common'
    }
})

module.exports = {
    entry: autoWebPlugin.entry({}),
    output:{
        path: path.resolve(__dirname, './dist'),
        publicPath: '/',
        filename: '[name].js'
    },
    resolve:{
        extensions: ['.js', '.jsx', '.css', '.json'],
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
            },
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ['env', 'react', 'stage-2']
                }
            }
        ]
    },
    plugins: [
        autoWebPlugin
    ],
    devtool: 'eval-source-map',
    devServer: {
        contentBase: path.resolve(__dirname, './dist'),
        port: 9000,
    }
}
