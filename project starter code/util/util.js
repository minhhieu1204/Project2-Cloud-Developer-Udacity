import fs from "fs";
import Jimp from "jimp";
import axios from "axios";
import {
  error
} from "console";

//document fix issue: https://stackoverflow.com/questions/61768743/node23042-unhandledpromiserejectionwarning-error-could-not-find-mime-for-bu
//https://github.com/jimp-dev/jimp/issues/775#issuecomment-521938738
//https://stackoverflow.com/questions/73564350/error-could-not-find-mime-for-buffer-null-jimp-node-js


// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL) {

  return new Promise(async (resolve, reject) => {
    let arraybuffer;
    await axios({
        method: 'get',
        url: inputURL,
        responseType: 'arraybuffer'
      })
      .then(function ({
        data: imageBuffer
      }) {
        return imageBuffer;
      })
      .then(data => {
        arraybuffer = data;
      })
      .catch(error => {
        reject(error);
      });

    try {
      const photo = await Jimp.read(arraybuffer);
      const outpath =
        "./tmp/filtered." + Math.floor(Math.random() * 2000) + ".jpg";
      await photo
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(outpath, (img) => {
          resolve(outpath);
        });
    } catch (error) {
      reject(error);
    }
  });

}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files) {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}