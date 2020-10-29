const data = require("./data");
const doMapping = require("./doMapping");
const fs = require("fs");

const { etrios, input, mapping } = data;

global.etrialInput = etrios;
if (!global.edcSubject) {
  global.edcSubject = {};
}

fs.writeFile("./out.json", doMapping(input, mapping), "utf8", function (err) {
  //如果err=null，表示文件使用成功，否则，表示希尔文件失败
  if (err) console.log("写文件出错了，错误是：" + err);
  else console.log("ok");
});
