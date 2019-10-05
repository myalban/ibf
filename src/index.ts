import fs = require("fs");
import { parseLogRecord } from "ibf-file-reader";
import { IBFRecord } from "ibf-file-reader/src/IBFRecord/IBFRecord";

console.log("Start...");
const file = fs.readFileSync('assets/130044267-2015-01-16-23-43-29.ibf');
const ibf = new IBFRecord(file)
let data: any = parseLogRecord(ibf);
console.log("File")
console.dir(data);



