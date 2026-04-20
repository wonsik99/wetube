const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  entry: {
    main: "./src/client/js/main.js",
    videoPlayer: "./src/client/js/videoPlayer.js",
    recorder: "./src/client/js/recorder.js",
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: "css/style.css" }),
    new CopyPlugin({
      patterns: [
        {
          from: "node_modules/@ffmpeg/ffmpeg/dist/umd/814.ffmpeg.js",
          to: "js/[name][ext]",
        },
      ],
    }),
  ],
  mode: "development",
  watch: true,
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
