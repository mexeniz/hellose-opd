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
		    o.patients.push(data);
			});
	  };
		o.addPhysicalRecord = function(patient, pRecord)
		{
			return $http.post('/records/physical/insert/'+ patient._id , pRecord).success(function(data){
		    patient.physical_record.push(data);
			});
		}

		o.getPatient = function(patient_id) {
			return $http.get('/patients/info/' +patient_id);
		}

	  return o;
	}]);
app.factory('records_fac', ['$http', function($http){
	  var o = {};
	  // Use Route! Connect to backend and retrieve data
	  o.deletePhysicalRecord = function(patid,physid) {
		console.log('Deleting :'+physid);
		return $http.delete('/records/physical/delete/'+patid+'/'+physid);
	  };
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

			var genPatientID = num.toString();
			while(genPatientID.length < 8) {
				genPatientID = Math.floor(Math.random()*10).toString() + genPatientID;
			}

			patients_fac.create(
				{
					patient_id : genPatientID,
					ssn: genSSN,
					address: 'Address ' + num,
					firstname: 'Firstname' + num,
					lastname: 'Lastname' + num,
					email: 'test' + num + '@test.com',
					gender: sex[Math.floor(Math.random() * sex.length)],
					blood_type: bloodType[Math.floor(Math.random() * bloodType.length)],
					tel_number: [genTelNum]
				}
			);
		};
	}
]);

app.controller('InfoCtrl', [
	'$scope',
	'patients_fac',
	'records_fac',

	function($scope, patients_fac,records_fac){

		$scope.init = function(patient_id) {
			$scope.patient_id = patient_id;
			console.log($scope.patient_id);
			patients_fac.getPatient($scope.patient_id).success(function(data){
				$scope.patient = data;
		    });
		}

		$scope.generatePhysicalRecord = function()
		{
			var pRecord = {
				weight: Math.floor(Math.random()*50 + 50),
				height: Math.floor(Math.random()*70 + 120),
				blood_pressure: Math.floor(Math.random()*50 + 100),
				pulse: Math.floor(Math.random()*30 + 30),
				temperature: Math.floor(Math.random()*5 + 35)
			};
			console.log(pRecord);
			patients_fac.addPhysicalRecord($scope.patient, pRecord);
		};

		$scope.createPhysicalRecord = function()
		{
			var pRecord = {
				weight: $scope.weight,
				height: $scope.height,
				blood_pressure: $scope.blood_pressure,
				pulse: $scope.pulse,
				temperature: $scope.temperature
			};
			console.log(pRecord);
			patients_fac.addPhysicalRecord($scope.patient, pRecord);
		};

		$scope.removePhysicalRecord = function(patid, physid ){
			if(confirm("Confirm na kub") ){
				records_fac.deletePhysicalRecord(patid, physid);
				for(var i = 0 ; i < $scope.patient.physical_record.length ; i++ ){
					if($scope.patient.physical_record[i]['_id'] == physid){
						$scope.patient.physical_record.splice(i,1) ;
					}
				}
			}
		};
	}
]);

})();
