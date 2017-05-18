const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const path = require('path')

let webpackConfig = {
    entry: {
        index: './src/index.js',
        app: './src/app.js'
    },
    output: {
        path: path.resolve(__dirname, 'build/dist'),
        filename: 'js/[name].bundle.js',
        publicPath: '/'
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }]
    },
    plugins: [
        new ProgressBarPlugin(),
        new HtmlWebpackPlugin({
            chunks: ['index'],
            title: 'homepage',
            template: './src/index.ejs'
        }),
        new HtmlWebpackPlugin({
            chunks: ['app'],
            title: 'app',
            template: './src/app.ejs',
            filename: 'app.html'
        })
    ]
};

module.exports = webpackConfig
