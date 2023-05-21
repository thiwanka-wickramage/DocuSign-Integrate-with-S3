"use strict";

let AWS = require("aws-sdk");

console.log("Loading function");

exports.handler = (event, context, callback) => {
  var parseString = require("xml2js").parseString;
  //slice date from Date and Time object
  var today = new Date().toISOString().slice(0, 10);

  parseString(event.body, "utf8", function (err, result) {
    if (err) console.log(err);
    var json = JSON.stringify(result);
    let data = JSON.parse(json);

    var pdfArray = data.DocuSignEnvelopeInformation.DocumentPDFs[0].DocumentPDF;
    var s3 = new AWS.S3();

    pdfArray.forEach(function (doc) {
      s3.putObject(
        {
          Bucket: "docusign-dev-bucket",
          Key: (today + "/" + doc.Name.toString()).split("_")[0] + ".pdf",
          Body: new Buffer(doc.PDFBytes.toString(), "base64"),
        },
        function (err) {
          if (err) {
            console.log(err);
            throw err;
          }
          console.log("Successfully uploaded..");
        }
      );
    });
  });

  callback(null, "");
};
