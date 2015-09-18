(function(){
var app = angular.module('patients', ['ui.router']) ;

app.factory('patient', ['$http', function($http){
	return {
		getList: function() {
			return $http.get('/patients/store');
		}
	}	  
}]);

app.controller('ListCtrl', [
	'$scope',
	'patient' , 
	function($scope , patient){
		patient.getList().success(function(data) {
			$scope.patients = data;
		});
	}
]);

})();