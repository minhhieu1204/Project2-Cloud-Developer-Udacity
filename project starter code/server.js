import express from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util.js";
import Jimp from "jimp";

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

// @TODO1 IMPLEMENT A RESTFUL ENDPOINT
// GET /filteredimage?image_url={{URL}}
// endpoint to filter an image from a public url.
// IT SHOULD
//    1
//    1. validate the image_url query
//    2. call filterImageFromURL(image_url) to filter the image
//    3. send the resulting file in the response
//    4. deletes any files on the server on finish of the response
// QUERY PARAMATERS
//    image_url: URL of a publicly accessible image
// RETURNS
//   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

/**************************************************************************** */

//! END @TODO1

// Root Endpoint
// Displays a simple message to the user
app.get("/", async (req, res) => {
  res.send("try GET /filteredimage?image_url={{}}");
});

app.get("/filteredimage", async (req, res) => {
  const imageUrlParam = req.query.image_url;
  if (imageUrlParam.length == 0) {
    return res.status(400).send(`image_url is required`);
  }

  //validate parameter query
  const regex = /^(https|http)(:\/\/){1}.*\w\.(jpg|png|jpeg)$/;
  if (!regex.test(imageUrlParam)) {
    return res.status(400).send(`image_url is invalid`);
  }

  let filePath;
  await filterImageFromURL(imageUrlParam)
    .then((result) => {
      filePath = result;
      Jimp.read(filePath, (err, image) => {
        // Convert the image to a Buffer
        image
          .getBufferAsync(Jimp.MIME_JPEG)
          .then((buffer) => {
            res.set({
              "Content-Type": "image/jpeg",
            });
            res.status(200);
            res.end(buffer);
          })
          .catch((bufferErr) => {
            return res.status(500).send(`Server Error`);
          });
      });
    })
    .catch((error) => {
      return res.status(500).send(`Server Error`);
    });

  const arrayFile = [filePath];
  await deleteLocalFiles(arrayFile);
});

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log(`press CTRL+C to stop server`);
});
