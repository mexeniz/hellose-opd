//AngularJS Client Side App 
//Anonymous Function binded with Angular module
//Angular Extension : ui.router
(function(){

var app = angular.module('appointment', ['ui.router','ngCsvImport']) ;
	
	app.controller('AppointmentCtrl', [	'$scope', 
		function($scope){
		  $scope.title = 'Appointment ตารางการนัดหมาย ';
	}]);

	//Importing CSV Here
	app.controller('ImportCtrl', [	'$scope', '$parse', 
		function($scope,$parse){
		  $scope.title = 'Importing ตารางการนัดหมาย ';
		  $scope.csv = {
		  		content: null,
		    	header: true,
		    	headerVisible: true,
		    	separator: ',',
		    	separatorVisible: true,
		    	result: 'json.result',
		    	encoding: 'ISO-8859-1',
		    	encodingVisible: true,
		  };

		  $scope.genMes = function(){
		  		var months_input = 'jan';
		  		var jsondata = {};
		  		jsondata = {'month': months_input , data :$scope.csv.result };
		  		console.log(jsondata);
		  }
		}]);
})();

