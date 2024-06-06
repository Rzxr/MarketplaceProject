/* eslint-disable */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "development",
    devtool: 'eval',

    // These are the TS entrypoints for the project
    entry: {

        // Note: root represents the URL at /.
        // We need to explicity set this so we do not get constant reloading with webpack.
        root: "./src/Pages/Home/Home.ts", 
        Home: "./src/Pages/Home/Home.ts",
        ListItem: './src/Pages/ListItem/ListItem.ts',
        Login: './src/Pages/Login/Login.ts',
        Account: './src/Pages/Account/Account.ts',
        Signup: './src/Pages/Signup/Signup.ts',
        Basket: './src/Pages/BasketCheckout/BasketCheckout.ts',
        OrderConfirmed: './src/Pages/OrderConfirmed/OrderConfirmed.ts',
        ItemDetail: './src/Pages/ItemDetail/ItemDetail.ts',
        SellerStatistics: './src/Pages/SellerStatistics/SellerStatistics.ts',
        EditItem: './src/Pages/EditItem/EditItem.ts',
        AllItems: './src/Pages/AllItems/AllItems.ts',
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].bundle.js",
        publicPath: '/',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'esbuild-loader',
                    options: {
                        loader: 'ts',
                        target: 'es2015',
                    },
                },
                // include: path.resolve(__dirname, 'src'),
                exclude: /node_modules/,
            },
            { 
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },

            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            }
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    plugins: [

        // Paths to HTML files
        new HtmlWebpackPlugin({
            template: './src/Pages/Home/Home.html',
            favicon: './icons/favicon.ico',
            filename: "Index.html",
            chunks: ["root"],
        }),

        new HtmlWebpackPlugin({
            template: './src/Pages/Home/Home.html',
            favicon: './icons/favicon.ico',
            filename: 'Home.html',
            chunks: ['Home'],
        }),

        new HtmlWebpackPlugin({
            template: './src/Pages/ListItem/ListItem.html',
            favicon: './icons/favicon.ico',
            filename: 'ListItem.html',
            chunks: ['ListItem'],
        }),

        new HtmlWebpackPlugin({
            template: './src/Pages/Login/Login.html',
            favicon: './icons/favicon.ico',
            filename: 'Login.html',
            chunks: ['Login'],
        }),

        new HtmlWebpackPlugin({
            template: './src/Pages/Account/Account.html',
            favicon: './icons/favicon.ico',
            filename: 'Account.html',
            chunks: ['Account'],
        }),

        new HtmlWebpackPlugin({
            template: './src/Pages/Signup/Signup.html',
            favicon: './icons/favicon.ico',
            filename: 'Signup.html',
            chunks: ['Signup'],
        }),

        new HtmlWebpackPlugin({
            template: './src/Pages/BasketCheckout/BasketCheckout.html',
            favicon: './icons/favicon.ico',
            filename: 'BasketCheckout.html',
            chunks: ['Basket'],
        }),

        new HtmlWebpackPlugin({
            template: './src/Pages/OrderConfirmed/OrderConfirmed.html',
            favicon: './icons/favicon.ico',
            filename: 'OrderConfirmed.html',
            chunks: ['OrderConfirmed'],
        }),

        new HtmlWebpackPlugin({
            template: './src/Pages/ItemDetail/ItemDetail.html',
            favicon: './icons/favicon.ico',
            filename: 'ItemDetail.html',
            chunks: ['ItemDetail'],
        }),

        new HtmlWebpackPlugin({
            template: './src/Pages/SellerStatistics/SellerStatistics.html',
            favicon: './icons/favicon.ico',
            filename: 'SellerStatistics.html',
            chunks: ['SellerStatistics'],
        }),

        new HtmlWebpackPlugin({
            template: './src/Pages/EditItem/EditItem.html',
            favicon: './icons/favicon.ico',
            filename: 'EditItem.html',
            chunks: ['EditItem'],
        }),

        new HtmlWebpackPlugin({
            template: './src/Pages/AllItems/AllItems.html',
            favicon: './icons/favicon.ico',
            filename: 'AllItems.html',
            chunks: ['AllItems'],
        }),
    ],

    cache: {
        type: 'filesystem',
      },

      optimization: {
        splitChunks: {
          chunks: 'all',
          minSize: 10000,
        },
    },
    
    devServer: {

        // Note: If this was publicly launched, a full build into the dist folder would be required. 
        static: {
            directory: path.join(__dirname, "img"),
        },

        compress: true,
        port: 3000, 
        open: true,
        liveReload: true,

        // Note: Enables HMR but conflicts with liveReload
        // hot: true,

        // Note: Write to disk but is very slow
        // devMiddleware: {
        //     writeToDisk: true,
        // },

        // Forces all (other) routes to go to Index.html
        historyApiFallback: {
            rewrites: [
                { from: /^\//, to: '/Index.html' },
            ]
        },
    }
};