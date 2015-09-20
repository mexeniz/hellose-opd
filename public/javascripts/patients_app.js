(function(){
var app = angular.module('patients', ['ui.router']) ;

app.factory('patient', ['$http', function($http){
	return {
		getList: function() {
			return $http.get('/patients/store');
		},
		sendData: function() {
			var obj = {aa:"sdfs",bb:"sdjsf"};
			return $http.post('/patients/test',obj);
		}
	}	  
}]);

app.controller('ListCtrl', [
	'$scope',
	'patient',
	function($scope , patient){
		patient.getList().success(function(data) {
			$scope.patients = data;
		});
		patient.sendData().success(function(data) {
			console.log(data);
		});
	}
]);

})();