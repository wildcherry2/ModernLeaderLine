const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (_env, argv) => {
    const isProduction = argv.mode === 'production';
    const outDir = isProduction ? 'dist' : 'testing';
    const tsconfig = isProduction ? 'tsconfig.lib.json' : 'tsconfig.json';
    const plugins = isProduction ? [] : [
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "./src/index.html"
        })
    ];

    return {
        mode: isProduction ? 'production' : 'development',
        entry: isProduction ? './src/index.ts' : './src/dev-index.ts',
        devtool: isProduction ? 'source-map' : 'inline-source-map',
        output: {
            filename: isProduction ? 'index.js' : 'bundle.js',
            path: path.resolve(__dirname, outDir),
            clean: true,
            ...(isProduction ? {
                library: {
                    name: 'ModernLeaderLine',
                    type: 'umd'
                },
                globalObject: 'globalThis'
            } : {})
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [{
                        loader: 'ts-loader',
                        options: {
                            configFile: tsconfig,
                            transpileOnly: isProduction
                        }
                    }],
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/i,
                    use: ["style-loader", "css-loader"]
                }
            ]
        },
        resolve: {
            extensions: ['.ts', '.js']
        },
        plugins,
        devServer: {
            static: {
                directory: path.join(__dirname, 'testing')
            },
            compress: true,
            port: 8080,
            open: false,
            hot: true
        }
    };
};
