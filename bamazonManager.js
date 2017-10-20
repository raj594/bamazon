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
	managerFunctions();



});


function allInfo() {
	connection.query('SELECT * FROM products', function (error, results, fields) {
		if(error){
			throw error;
		}
		
		console.table(results)
	});
}


function managerInfo(callback) {
	connection.query('SELECT * FROM products', function (error, results, fields) {
		if(error){
			throw error;
		}
		var inventory = [];
		for (var i = 0; i < results.length; i++) {
			inventory.push({
				item: results[i].item_id,
				product: results[i].product_name,
				price: results[i].price,
				quantity: results[i].stock_quantity
			})
		}
		console.table(inventory)
		callback()
	});
}

function stockAdd(callback) {
		inquirer
		.prompt([
			{
				type: "input",
		        message: "What is the ID of the product you would like to add stock to?",
		        name: "productID"
			},
			{
				type: "input",
		        message: "How many units would you like to add?",
		        name: "quantity"
			},
			])
		.then(function(inquirerResponse){
			updateProduct(inquirerResponse.productID, inquirerResponse.quantity)
			callback()
		});


}


function updateProduct(item_id, quantity) {
  var query = connection.query(
    "UPDATE products SET stock_quantity = stock_quantity + ? WHERE ?",
    [quantity, item_id],

    function(err, res) {
      // console.log(res.affectedRows + " products updated!\n");
    }
  );
}

function addNewProduct(callback){

		inquirer
		.prompt([
			{
				type: "input",
		        message: "What is the name of the product you would like to add?",
		        name: "product_name"
			},
			{
				type: "input",
		        message: "What department should the product go in",
		        name: "department_name"
			},
			{
				type: "input",
		        message: "How much does it cost?",
		        name: "price"
			},
			{
				type: "input",
		        message: "How many units are we going to have available?",
		        name: "stock_quantity"
			},
			])
		.then(function(inquirerResponse){
			createProduct(inquirerResponse.product_name, inquirerResponse.department_name, inquirerResponse.price, inquirerResponse.stock_quantity)
			callback()
		});

}

function createProduct(product_name, department_name, price, stock_quantity) {
	connection.query('INSERT INTO `products` (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)', 
		[product_name, department_name, price, stock_quantity],
		function(error, results, fields) {
			if(error){
				throw error;
			}
		});
}

function lowInventory(callback) {
	connection.query('SELECT * FROM products WHERE stock_quantity<5', function (error, results, fields) {
		if(error){
			throw error;
		}
		var inventory = [];
		for (var i = 0; i < results.length; i++) {
			inventory.push({
				item: results[i].item_id,
				product: results[i].product_name,
				price: results[i].price,
				quantity: results[i].stock_quantity
			})
		}
		console.table(inventory)
		callback()
	});
}



function managerFunctions(){
	inquirer
	.prompt([
		{
			type: "list",
	        message: "Manager Functions",
	        choices: ["View Products for Sale","View Low Inventory","Add to Inventory","Add New Product"],
	        name: "action"
		},

		])
	.then(function(inquirerResponse){
		if(inquirerResponse.action === "View Products for Sale"){
			managerInfo(function(){
				managerFunctions();
			});

		} else if(inquirerResponse.action === "View Low Inventory") {
			lowInventory(function(){
				managerFunctions();
			});
		} else if(inquirerResponse.action === "Add to Inventory") {
			managerInfo(function(){
				stockAdd(function(){
					managerFunctions();
				});
			});
			
		} else if(inquirerResponse.action === "Add New Product") {
			addNewProduct(function(){
				managerFunctions();
			})
		}
	});
}