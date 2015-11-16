//AngularJS Client Side App 
//Anonymous Function binded with Angular module
//Angular Extension : ui.router
(function(){

var app = angular.module('appointment', ['ui.router']) ;
	
	app.controller('AppointmentCtrl', [	'$scope', 
		function($scope){
		  $scope.title = 'Appointment ตารางการนัดหมาย ';
	}]);

})();

