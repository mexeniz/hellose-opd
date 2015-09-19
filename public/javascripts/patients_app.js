(function(){
var app = angular.module('patients', ['ui.router']) ;

app.factory('patient', ['$http', function($http){
	return {
		getList: function() {
			return $http.get('/patients/store');
		},
		create: function(patient) {
			console.log(patient);
		  return $http.post('/patients/insert', patient);
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
		$scope.generateData = function() {
			//patient.create({ssn: '1234567890123', firstname: 'test', lastname: 'test', email: 'test@test.com', gender: 'm', blood_type: 'A', tel_number: ['0831111111']});
			patient.create({firstname: 'fuck u bitchhhhhhhhhh'}).success(function(data){
		    console.log(data);
				$scope.patients.push(data);
			});
		};
	}
]);

})();
