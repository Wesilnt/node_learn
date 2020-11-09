const order = require("./order/order");

const rememberMe = false;
const password_d = "Taimei@123";
const phone_d = "15201780237";
const user_d = "lei.wu";

const getUser = () => {
  
  const paramArr = process.argv.splice(2);

  // console.log(paramArr)

  const [username=user_d,phone=phone_d,password=password_d] = paramArr

  console.log(`${username} , 订餐电话：${phone} `);

  return {
    username,
    password,
    phone,
    rememberMe,
  };
};

order(getUser()).then((res) => console.log(res));
