/*
 * @Description: predict the potential targets of query molecule through *ppb2*
 * @Author: Kotori Y
 * @Date: 2021-04-17 14:18:32
 * @LastEditors: Kotori Y
 * @LastEditTime: 2021-04-17 16:07:21
 * @FilePath: \targetPrediction-JS\target_prediction\ppb2.js
 * @AuthorMail: kotori@cbdd.me
 *
 * @url: https://ppb2.gdb.tools/#
 */

const fetch = require("node-fetch");
const cheerio = require("cheerio");

const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const readCSV = require("./readCSV");

async function PredictByPPB2(smiles, method = "NN(ECfp4)", idx = 1) {
  console.log(`>>> waiting ${idx} ppb2-${method}...`);
  var cols = ["Rank", "ChEMBL ID", "Common name", "Method", "pair"];
  var urls = new Map([
    [
      "NN(ECfp4)",
      `https://ppb2.gdb.tools/predict?smi=${smiles}&fp=ECfp4&method=Sim&scoringmethod=TANIMOTO`,
    ],
    [
      "NN(ECfp4) + NB(ECfp4)",
      `https://ppb2.gdb.tools/predict?smi=${smiles}&fp=ECfp4&method=SimPlusNaiveBayes&scoringmethod=TANIMOTO`,
    ],
    [
      "NN(Xfp) + NB(ECfp4)",
      `https://ppb2.gdb.tools/predict?smi=${smiles}&fp=Xfp&method=SimPlusNaiveBayes&scoringmethod=CBD`,
    ],
    [
      "DNN(ECfp4)",
      `https://ppb2.gdb.tools/predict?smi=${smiles}&fp=ECfp4&method=DNN&scoringmethod=TANIMOTO`,
    ],
  ]);

  var out = [];

  const url = urls.get(method);
  // console.log(url)
  try {
    var resp = await fetch(url, { method: "GET", timeout: 180000 });
    var html = await resp.text();

    var $ = cheerio.load(html);

    var reg = /(?<=CHEMBL\d+\=fld\=).*?(?=\s|')/g;
    var _simi = $(".showNNBtn");
    console.log(typeof _simi.eq(0).attr("onclick"));
    var simi = [];
    for (let i = 0; i <= _simi.length - 1; i++) {
      simi.push(_simi.eq(i).attr("onclick").match(reg));
    }

    console.log(simi);

    var contents = $("#resultTable tr")
      .text()
      .trim()
      .split("\n\n")
      .map((ele) =>
        ele
          .trim()
          .split("\n")
          .map((ele) => ele.trim())
      );

    var cols = contents[0];
    var lines = contents.slice(1);

    lines.forEach((line, i) => line.push(idx, simi[i].join("|")));

    cols[cols.length - 1] = "Method";
    cols.push("idx", "simi");

    for (let line of lines) {
      var temp = {};
      line[line.length - 3] = method;
      for (var i = 0; i < line.length; i++) {
        temp[cols[i]] = line[i];
      }
      out.push(temp);
    }
  } catch {
    var temp = {};
  }

  return {
    cols: cols,
    out: out,
  };
}

async function main(inputFile, outputFile, method = "NN(ECfp4)") {
  var rows = readCSV.readTXT(inputFile);
  //   console.log(rows);

  for (let row of rows) {
    row = row.split("\t");
    let res = await PredictByPPB2(row[0], method, row[1]);
    console.log(row[0]);
    // let res = await getPpbRes(row[0], row[1])
    let header = [];
    for (var _col of res.cols) {
      header.push({ id: _col, title: _col });
    }
    // console.log(header);
    // console.log("====== writing ======");
    let csvWriter = createCsvWriter({
      path: outputFile,
      header: header,
      append: true,
    });
    csvWriter.writeRecords(res.out);
  }
}

let inputFile = "./data/temp.txt";
let outputFile = "./data/tempOut.csv";

const methods = [
  "NN(ECfp4)",
  "NN(ECfp4) + NB(ECfp4)",
  "NN(Xfp) + NB(ECfp4)",
  "DNN(ECfp4)",
];

main(inputFile, outputFile, methods[0]);

if (false) {
  (async () => {
    var smiles = "Oc1cc(CCl)ccc1Oc2ccc(Cl)cc2Cl";

    const result = await PredictByPPB2(smiles, "NN(ECfp4)", "demo");
    console.log(result);
  })();
}
