const path = require('path');

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: [/node_modules/, /type_tests/, /unit_tests/],
            },
        ],
    },
    resolve: {
        extensions: [ '.ts' ],
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'cleandi',
        libraryTarget: "umd",
        umdNamedDefine: true,
        globalObject: 'this'
    },
};