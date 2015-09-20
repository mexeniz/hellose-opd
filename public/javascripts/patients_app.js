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
			var sex = ['m', 'f'];
			var bloodType = ['A', 'B', 'AB', 'O'];
			var num = $scope.patients.length;

			var genSSN = num.toString();
			while(genSSN.length < 13) {
				genSSN = Math.floor(Math.random()*10).toString() + genSSN;
			}

			var genTelNum = num.toString();
			while(genTelNum.length < 9) {
				genTelNum = Math.floor(Math.random()*10).toString() + genTelNum;
			}
			genTelNum = '0' + genTelNum.toString();

			patient.create(
				{
					ssn: genSSN,
					firstname: 'Firstname' + num,
					lastname: 'Lastname' + num,
					email: 'test' + num + '@test.com',
					gender: sex[Math.floor(Math.random() * sex.length)],
					blood_type: bloodType[Math.floor(Math.random() * bloodType.length)],
					tel_number: [genTelNum]
				}
			).success(function(data){
		    console.log(data);
				$scope.patients.push(data);
			});
		};
	}
]);

})();
