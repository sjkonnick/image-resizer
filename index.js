const express = require("express");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger.json");
const app = express();
const sharp = require("sharp");
const request = require("request");
const path = require("path");
const fs = require("fs");
const { isValidExtension } = require("./utils/isValidExtension.js")
require('dotenv').config()
const port = process.env.PORT;
const uuid = require("uuid");

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.get("/resizer/*", (req, res, next) => {
  const imagePath = req.originalUrl.split("/resizer/")[1];

  request({ url: decodeURIComponent(imagePath), encoding: null }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const width = req.query.width ? parseInt(req.query.width) : null;
      const height = req.query.height ? parseInt(req.query.height) : null;
      const top = req.query.top ? parseInt(req.query.top) : 0;
      const left = req.query.left ? parseInt(req.query.left) : 0;

      sharp(body).metadata().then(data => {
        if (isValidExtension(data.format)) {
          const fileName = `${uuid.v4()}.${data.format}`;
          const options = {
            root: path.join(__dirname),
          };

          const cropWidth = req.query.cropWidth ? parseInt(req.query.cropWidth) : parseInt(data.width) - left;
          const cropHeight = req.query.cropHeight ? parseInt(req.query.cropHeight) : parseInt(data.height) - top;
          
          if (top === NaN || left === NaN || cropWidth === NaN || cropHeight === NaN || width === NaN || height === NaN) {
            res.status(400).end("One or more query parameters is not a number");
            next();
          }
          if (top > parseInt(data.height)) {
            res.status(400).end("Top parameter larger than image height");
            next();
          } 
          if (left > parseInt(data.width)) {
            res.status(400).end("Left parameter larger than image width");
            next();
          } 
          if (cropWidth > (parseInt(data.width) - left)) {
            res.status(400).end("Crop width too large");
            next();
          } 
          if (cropHeight > (parseInt(data.height) - top)) {
            res.status(400).end("Crop height too large");
            next();
          }

          sharp(body, { animated: data.pages && data.pages > 1 })
            .extract({ left: left, top: top, width: cropWidth, height: cropHeight})
            .resize(width, height)
            .toFile(fileName)
            .then(function (newFile) {
              if (newFile) {
                res.sendFile(fileName, options, function (e) {
                  if (e) {
                    console.error("Error sending file:", e);
                    res.status(400).end("Error sending file");
                    next();
                  } else {
                    console.log("Sent:", fileName);
                    fs.unlinkSync(`./${fileName}`);
                  }
                });
              }
            })
            .catch(function (err) {
              console.error("Sharp error:", err);
              res.status(400).end("Image processing error");
              next();
            });
        } else {
          console.error("Not a valid image extension");
          res.status(415).end("Not a valid image extension");
          next();
        }
      }).catch(function (err) {
        console.error("Sharp error:", err);
        res.status(400).end("Image processing error");
        next();
      });
    } else {
      console.error("Not a valid image URI");
      res.status(400).end("Not a valid image URI");
      next();
    }
  });
});

app.listen(port);
