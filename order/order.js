const fetch = require("node-fetch");
const querystring = require("querystring");
const { url } = require("./common.js");
const login = require("./login");
const FormData = require('form-data');

module.exports = async function (params) {
  const {phone,...loginInfo} = params;
  const cookie = await login(loginInfo);
  if (cookie === false) throw new Error("login fail");

  const form = new FormData();

  form.append('city', '上海');
  form.append('phone', phone);

  const ordering = await fetch(
    `${url}module/dinner/add`,
    {
      method: "post",
      headers: {
        // "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Cookie: cookie,
        ...form.getHeaders()
      },
      body: form
    }
  ).then((res) => {
    return res.json({
      city: "上海",
      remark: "test node 命令行 订餐",
    });
  });
  return ordering;
};
