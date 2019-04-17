//LOAD VARIABLES AND DEPENDENCIES
var mysql = require("mysql");
var table = require("console.table");
var inquirer = require("inquirer");
//LOAD DATABASE CONNECTION
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "bamazon_db"
});
//LIST PRODUCTS IN A TABLE
function listProducts() {
  connection.connect(function (err) {
    connection.query("SELECT * FROM products", function (err, res) {
      if (err) throw err
      else console.table(res, "\n");
      productId();
    });
  });
}
listProducts();
//USING INQUIRER: PROMPT FOR INPUT FROM USER
function productId() {
  inquirer.prompt([{
      type: "input",
      name: "id",
      message: "Enter the product you would like to purchase:\n",
      validate: function (value) {
        if (!isNaN(value) && value < 11) {
          return true;
        }
        return false;
      }
    },

    {
      type: "input",
      name: "quant",
      message: "Enter the quantity you would like to buy? \n",
      validate: function (value) {
        if (!isNaN(value)) {
          return true;
        }
        return false;
      }
    }
    //WITH USER INPUT, GRAB AND UPDATE THE DATABASE
  ]).then(function (answer) {

    var userId = answer.id;
    console.log("Chosen item id: ", userId);
    var userQuant = answer.quant;
    console.log("Chosen quantity from stock: ", userQuant, "\n");
    connection.query("SELECT * FROM products WHERE ?", [{
      item_id: answer.id
    }], function (err, res) {
      if (err) throw err;
      console.table(res);
      var current_quantity = res[0].stock_quantity;
      console.log("IN-STOCK: ", current_quantity);
      var price = res[0].price;
      var remaining_quantity = current_quantity - answer.quant;
      console.log("REMAINING STOCK: ", remaining_quantity);
      if (current_quantity > answer.quant) {
        console.log("Amount Remaining: " + remaining_quantity);
        console.log("Total Cost: " + (answer.quant * price) + "\n");
        connection.query("UPDATE products SET stock_quantity=? WHERE item_id=?",
          [
            remaining_quantity, answer.id
          ],
          function (err, res) {
            // console.table(res);
          });
        connection.query("SELECT * FROM products", function (err, res) {
          console.log("INVENTORY UPDATED: ");
          console.log("=============================================== \n");
          console.table(res);
        });
      } else {
        console.log("Insufficient amounts, please edit your units!");
      }
      connection.end();
    });
  })

}