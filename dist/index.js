"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var ibf_file_reader_1 = require("ibf-file-reader");
var IBFRecord_1 = require("ibf-file-reader/src/IBFRecord/IBFRecord");
console.log("Start...");
var file = fs.readFileSync('assets/130044267-2015-01-16-23-43-29.ibf');
var ibf = new IBFRecord_1.IBFRecord(file);
var data = ibf_file_reader_1.parseLogRecord(ibf);
console.log("File");
console.dir(data);
//# sourceMappingURL=index.js.map