var mysql = require('mysql');
var inquirer = require('inquirer');
require('console.table')

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  // password : '',
  database : 'bamazon'
});
 
connection.connect(function(error){
	if(error){
		throw error;
	}
	console.log("connected, id: " + connection.threadId)
	customerInfo(function() {
		whatDoYouWant();
	});


});

function customerInfo(callback) {
	connection.query('SELECT * FROM products', function (error, results, fields) {
		if(error){
			throw error;
		}
		var inventory = [];
		for (var i = 0; i < results.length; i++) {
			inventory.push({
				item: results[i].item_id,
				product: results[i].product_name,
				price: results[i].price
			})
		}
		console.table(inventory)
		callback(inventory)
	});
}

function allInfo() {
	connection.query('SELECT * FROM products', function (error, results, fields) {
		if(error){
			throw error;
		}
		
		console.table(results)
	});
}

function whatDoYouWant(){
	inquirer
	.prompt([
		{
			type: "input",
	        message: "What is the ID of the product you would like to purchase?",
	        name: "productID"
		},
		{
			type: "input",
	        message: "How many units would you like to purchase?",
	        name: "quantity"
		},
		])
	.then(function(inquirerResponse){
		quantityCheck(inquirerResponse.productID, function(quantity, price){
			if (inquirerResponse.quantity > quantity){
				console.log("Insufficient quantity!\n\n")
			  	customerInfo(function() {
					whatDoYouWant();
				});

			} else {
				quantity -= inquirerResponse.quantity;
				updateProduct(inquirerResponse.productID, quantity)
				console.log("That'll be " + (inquirerResponse.quantity * price) + " monopoly monies, please.\n\n")
				customerInfo(function() {
					whatDoYouWant();
				});
			}
		});
	});
}

function updateProduct(item_id, quantity) {
  var query = connection.query(
    "UPDATE products SET ? WHERE ?",
    [ 
      {
        stock_quantity: quantity
      },
      {
        item_id: item_id
      }
      
    ],
    function(err, res) {
      // console.log(res.affectedRows + " products updated!\n");
    }
  );
}

function quantityCheck(item_id, callback) {
	connection.query('SELECT * FROM `products` WHERE `item_id` = ?',
		[item_id], 
		function (error, results, fields) {
		if(error){
			throw error;
		}
		callback(results[0].stock_quantity, results[0].price)
	});
}