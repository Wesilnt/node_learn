const order = require("./order/order");

const rememberMe = false;
const password_d = "Taimei@123";
const user_d = "lei.wu";

const getUser = () => {
  const paramArr = process.argv.splice(2);
  let username = paramArr[0] || user_d;
  let password = password_d;
  if (paramArr.length > 1) {
    password = paramArr[1];
  }

  console.log(`订餐者 : ${username}`);

  return {
    username,
    password,
    rememberMe,
  };
};

order(getUser()).then((res) => console.log(res));
