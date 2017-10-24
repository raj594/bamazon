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
	supervisorFunctions();

});


function supervisorFunctions(){
	inquirer
	.prompt([
		{
			type: "list",
	        message: "Supervisor Functions",
	        choices: ["View Product Sales by Department","Create New Department"],
	        name: "action"
		},

		])
	.then(function(inquirerResponse){
		if(inquirerResponse.action === "View Product Sales by Department"){
			
		} else if(inquirerResponse.action === "Create New Department") {

		} 
	});
}