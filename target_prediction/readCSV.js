/*
 * @Description:
 * @Author: Kotori Y
 * @Date: 2020-12-29 15:22:21
 * @LastEditors: Kotori Y
 * @LastEditTime: 2021-04-17 15:58:28
 * @FilePath: \targetPrediction-JS\target_prediction\readCSV.js
 * @AuthorMail: kotori@cbdd.me
 */

// const { read } = require("fs");

const csv = require("csv-parser");
const fs = require("fs");

const readCSV = (filePath, callback) => {
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      // console.log(typeof row);
      callback(null, row);
    })
    .on("end", () => {
      console.log("CSV file successfully processed");
    });
};

const readTXT = (filePath) => {
  try {
    var data = fs.readFileSync(filePath, "utf8");
    // console.log(data.split("\r\n"));
    return data.split("\r\n");
  } catch (e) {
    console.log("Error:", e.stack);
  }
};

if (false) {
  rows = readTXT("./data/set-1443.txt");
  console.log(rows);
}


module.exports = { readCSV, readTXT };
