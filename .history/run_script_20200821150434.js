const data = require("./data");
const doMapping = require("./doMapping");

const { etrios, input, mapping } = data;

global.etrialInput = etrios;

doMapping(input, mapping);
