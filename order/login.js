const fetch = require("node-fetch");
const querystring = require("querystring");
const { url } = require("./common");
const getCookie = require("./getCookie");

module.exports = async function (params) {
  const cookie = await getCookie();
  if(typeof cookie !== 'string') {
    console.log(cookie);
    return;
  }

  const response = await fetch(`${url}login?${querystring.stringify(params)}`, {
    method: "post",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Cookie: cookie,
    },
  }).then((res) => {
    const new_cookie = res.headers.get("set-cookie");
    if (params.rememberMe) {
      cookie += new_cookie;
    }
    return res.json();
  });
  if (response.msg !== "操作成功"){
    console.log(response)
    console.log(params)
    return false
  } ;
  return cookie;
};
