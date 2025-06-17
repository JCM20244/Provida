const mysql  = require('mysql2');
const con = mysql.createPool({
  connectionLimit: 10,
  host: "bu2ehbib5uen0dccrtrl-mysql.services.clever-cloud.com",
  user: "upavyfyxzugiwfru",
  password: "szp50qoOl8EThnCmhK78",
  database: "bu2ehbib5uen0dccrtrl",
  port: 3306
}
);
module.exports = con;

