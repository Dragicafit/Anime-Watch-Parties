const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");

/** @type {webpack.Configuration} */
module.exports = (env, argv) => ({
  mode: "production",
  entry: {
    "src/background-scripts/background":
      "./src/background-scripts/backgroundScript.ts",
    "src/popup/js/popup": "./src/popup/js/popupScript.ts",
    "src/content-scripts/tab/tab": "./src/content-scripts/tab/tabScript.ts",
    "src/web-accessible-resources/chat/js/chat":
      "./src/web-accessible-resources/chat/js/chatScript.ts",
    "src/web-accessible-resources/js/player":
      "./src/web-accessible-resources/js/playerScript.ts",
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.ts$/i,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/i,
        use: [
          // MiniCssExtractPlugin.loader,
          "style-loader",
          {
            loader: "css-loader",
            options: {
              sourceMap: false,
              url: false,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif$)/i,
        loader: "file-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".scss"],
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "built/Firefox/"),
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "LICENSE" },
        {
          from: "manifest.json",
          transform(content, path) {
            return argv.mode === "development"
              ? content.toString().replace("awp.moe", "localhost")
              : content;
          },
        },
        { from: "src/icons", to: "src/icons" },
        {
          from: "src/content-scripts/listener.js",
          to: "src/content-scripts/listener.js",
        },
        {
          from: "src/content-scripts/listener3.js",
          to: "src/content-scripts/listener3.js",
        },
        { from: "src/popup/popup.html", to: "src/popup/popup.html" },
      ],
    }),
    new CleanWebpackPlugin(),
  ],
});
