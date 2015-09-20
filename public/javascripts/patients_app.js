(function(){
var app = angular.module('patients', ['ui.router']) ;

app.factory('patients_fac', ['$http', function($http){
	  var o = {
	  	patients : []
	  };
	  // Use Route! Connect to backend and retrieve data
	  o.getList = function() {
	    return $http.get('/patients/store').success(function(data){
	      for(var i = 0  ; i < data.length  ; i++){
					o.patients.push(data[i]);
					console.log(o.patients[o.patients.length-1]);
				}
	    });
	  };
	  o.create = function(patient) {
		  return $http.post('/patients/insert', patient).success(function(data){
				console.log(data);
		    o.patients.push(data);
			});
	  };
		o.addPhysicalRecord = function(patient, pRecord)
		{
			return $http.post('/' + patient._id + '/physicalrecord/insert', pRecord).success(function(data){
				console.log(data);
		    patient.physical_record.push(data);
			});
		}
	  return o;
	}]);

app.controller('ListCtrl', [
	'$scope',
	'patients_fac',

	function($scope, patients_fac){
		patients_fac.getList();
		$scope.patients = patients_fac.patients;

		// Function to generate mock-up patient data
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

			patients_fac.create(
				{
					ssn: genSSN,
					firstname: 'Firstname' + num,
					lastname: 'Lastname' + num,
					email: 'test' + num + '@test.com',
					gender: sex[Math.floor(Math.random() * sex.length)],
					blood_type: bloodType[Math.floor(Math.random() * bloodType.length)],
					tel_number: [genTelNum]
				}
			);
		};

		$scope.generatePhysicalRecord = function(patient)
		{
			var pRecord = {
				weight: Math.floor(Math.random()*50 + 50),
				height: Math.floor(Math.random()*70 + 120),
				blood_pressure: Math.floor(Math.random()*50 + 100),
				pulse: Math.floor(Math.random()*30 + 30),
				temperature: Math.floor(Math.random()*5 + 35)
			};
			console.log(pRecord);
			patients_fac.addPhysicalRecord(patient, pRecord);
		};
	}
]);

})();
