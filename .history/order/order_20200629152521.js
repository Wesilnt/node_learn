const fetch = require("node-fetch");
const querystring = require("querystring");
const { url } = require("./common.js");
const login = require("./login");

module.exports = async function (params) {
  const cookie = await login(params);
  if (cookie === false) throw new Error("login fial");

  const ordering = await fetch(
    `${url}module/dinner/add?${querystring.stringify({
      city: "上海",
      remark: "test node 命令行 订餐",
    })}`,
    {
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Cookie: cookie,
      },
    }
  ).then((res) => {
    return res.json();
  });
  return ordering;
};
