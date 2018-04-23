const UglifyJSPlugin = require("uglifyjs-webpack-plugin")
const CopyWebPackPlugin = require("copy-webpack-plugin")
const HappyPack = require("happypack")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")

// const WebpackShellPlugin = require('webpack-shell-plugin')

module.exports = {
    entry: {
        background: "./src/background.ts",
        content: "./src/content.ts",
        commandline_frame: "./src/commandline_frame.ts",
    },
    output: {
        filename: "[name].js",
        path: __dirname + "/build",
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "inline-source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"],
        // plugins: [new TsconfigPathsPlugin({configFile: 'tsconfig.json'})]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, use: "happypack/loader?id=ts" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            // { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ],
    },

    plugins: [
        // new UglifyJSPlugin({
        //     uglifyOptions: {
        //         ecma: 8
        //     }
        // }),
        // new WebpackShellPlugin({onBuildStart: [
        //     'mkdir -p generated/static',
        //     'scripts/excmds_macros.py',
        //     'scripts/newtab.md.sh',
        //     'scripts/make_docs.sh',
        // ]}),
        new CopyWebPackPlugin([
            { from: "src/manifest.json" },
            {
                from: "src/static",
                to: "static",
                ignore: ["*.psd", "*1024px.png"],
            },
            { from: "generated/static", to: "static" },
        ]),

        new HappyPack({
            id: "ts",
            threads: 4,
            loaders: [
                {
                    path: "ts-loader",
                    query: {
                        happyPackMode: true,
                        configFile: "tsconfig.json",
                    },
                },
            ],
        }),
        new ForkTsCheckerWebpackPlugin({
            tsconfig: "tsconfig.json",
        }),
    ],
}
