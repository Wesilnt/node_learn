const fetch = require("node-fetch");
const querystring = require("querystring");
const { url } = require("./common");

module.exports = async function () {
  return await fetch(`${url}login`).then((res) => {
    const cookie = res.headers.get("set-cookie").split(";")[0];
    return typeof cookie === 'string' ? cookie : res.text();
  });
};
