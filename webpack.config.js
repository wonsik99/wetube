const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

const BASE_JS = "./src/client/js/";

module.exports = {
  entry: {
    main: BASE_JS + "main.js",
    videoPlayer: BASE_JS + "videoPlayer.js",
    recorder: BASE_JS + "recorder.js",
    commentSection: BASE_JS + "commentSection.js",
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: "css/style.css" }),
    new CopyPlugin({
      patterns: [
        {
          from: "node_modules/@ffmpeg/ffmpeg/dist/umd/814.ffmpeg.js",
          to: "js/[name][ext]",
        },
        {
          from: "src/client/img",
          to: "img",
        },
      ],
    }),
  ],
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"),
    publicPath: "/assets/",
    clean: true,
  },
  resolve: {
    alias: {
      "@ffmpeg/util": path.resolve(
        __dirname,
        "node_modules/@ffmpeg/util/dist/esm/index.js",
      ),
      "@ffmpeg/ffmpeg": path.resolve(
        __dirname,
        "node_modules/@ffmpeg/ffmpeg/dist/umd/ffmpeg.js",
      ),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                { modules: "commonjs", targets: "defaults" },
              ],
            ],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
};
