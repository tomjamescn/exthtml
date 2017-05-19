const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const path = require('path')

let webpackConfig = {
    entry: {
        index: './src/index.js',
        app: './src/app.js',
        d3_demo_1: './src/appviews/d3_demo_1.js',
        d3_stock_chart: './src/appviews/d3_stock_chart.js'
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
        }),
        new HtmlWebpackPlugin({
            chunks: ['d3_demo_1'],
            title: 'd3_demo_1',
            template: './src/appviews/d3_demo_1.ejs',
            filename: 'd3_demo_1.html',
            inject: false
        }),
        new HtmlWebpackPlugin({
            chunks: ['d3_stock_chart'],
            title: '股票',
            template: './src/appviews/d3_stock_chart.ejs',
            filename: 'd3_stock_chart.html',
            inject: false
        })
    ]
};

module.exports = webpackConfig
