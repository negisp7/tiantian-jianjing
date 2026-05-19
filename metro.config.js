const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const fs = require("fs");
const path = require("path");

const config = getDefaultConfig(__dirname);
const defaultEnhanceMiddleware = config.server?.enhanceMiddleware;

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    const enhanced = defaultEnhanceMiddleware
      ? defaultEnhanceMiddleware(middleware, server)
      : middleware;

    return (req, res, next) => {
      const requestUrl = req.url ?? "";
      const audioPrefix = "/assets/.%2Fassets%2Faudio/";

      if (requestUrl.startsWith(audioPrefix)) {
        const rawFilename = requestUrl.slice(audioPrefix.length).split("?")[0];
        const filename = decodeURIComponent(rawFilename);
        const filePath = path.join(__dirname, "assets", "audio", filename);

        if (filePath.startsWith(path.join(__dirname, "assets", "audio")) && fs.existsSync(filePath)) {
          res.writeHead(200, {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public,max-age=31536000,immutable",
          });
          fs.createReadStream(filePath).pipe(res);
          return;
        }
      }

      enhanced(req, res, next);
    };
  },
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules
  // This fixes iOS styling issues in development mode
  forceWriteFileSystem: true,
});
