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


		o.getPatient = function(patient_id) {
			return $http.get('/patients/info/' +patient_id);
		}

	  return o;
	}]);
app.factory('physical_records_fac', ['$http', function($http){
	  var o = {};
	  // Use Route! Connect to backend and retrieve data
		o.add = function(patient, pRecord)
		{
			return $http.post('/records/physical/insert/'+ patient._id , pRecord).success(function(data){
		    patient.physical_record.push(data);
			});
		}

	  o.update = function(patient, pRecord)
		{
			return $http.put('/records/physical/update/'+ pRecord._id , pRecord).success(function(data){
		    for(var i = 0; i < patient.physical_record.length; i++)
				{
					if(patient.physical_record[i]._id == data._id)
					{
						patient.physical_record[i] = data;
					}
				}
			});
		}

	  o.delete = function(patient, pRecord, index) {
			return $http.delete('/records/physical/delete/' + patient._id + '/' + pRecord._id).success(function() {
				// If succeeded, delete it from view
				patient.physical_record.splice(index,1);
			});
	  };
	  return o;
	}]);

app.factory('medical_records_fac', ['$http', function($http){
	  var o = {};
	  // Use Route! Connect to backend and retrieve data
		o.add = function(patient, medRecord)
		{

			// Get disease id only!
			var newMedRecord = {};
			angular.copy(medRecord, newMedRecord);
			if(medRecord.diseases.length > 0) newMedRecord.diseases = [];
			for(var i = 0; i < medRecord.diseases; i++)
			{
				// FIX ME!
				//newMedRecord.diseases.push(medRecord.disease[i]._id);
			}

			return $http.post('/records/medical/insert/'+ patient._id , newMedRecord).success(function(data){
					// If succeeded, push it to display
		    	patient.medical_record.push(data);
			});
		}

	  o.update = function(patient, medRecord)
		{
			// Get disease id only!
			var newMedRecord = {};
			angular.copy(medRecord, newMedRecord);
			for(var i = 0; i < medRecord.diseases; i++)
			{
				newMedRecord.diseases.push(medRecord.disease[i]._id);
			}

			return $http.put('/records/medical/update/'+ medRecord._id , newMedRecord).success(function(data){
					for(var i = 0; i < patient.medical_record.length; i++)
					{
						if(patient.medical_record[i]._id == data._id)
						{
							patient.medical_record[i] = data;
						}
					}
			});
		}

		o.delete = function(patient, medRecord, index) {
			return $http.delete('/records/medical/delete/' + patient._id + '/' + medRecord._id).success(function() {
				// If succeeded, delete it from view
				patient.medical_record.splice(index,1);
			});
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
	'physical_records_fac',
	'medical_records_fac',
	function($scope, patients_fac, physical_records_fac, medical_records_fac){
		$scope.init = function(patient_id) {
			$scope.patient_id = patient_id;
			console.log($scope.patient_id);
			patients_fac.getPatient($scope.patient_id).success(function(data){
				$scope.patient = data;
		    });
		}

		// PHYSICAL RECORD
		$scope.showPhysModal = false;
		$scope.showPhysicalRecordForm = function(mode,pRecord){

			$scope.mode = mode;

			if(mode == 'edit'){
				$scope.physicalRecord = {};
				angular.copy(pRecord, $scope.physicalRecord);
			}

			else if(mode == 'create'){
				$scope.physicalRecord = {};
			};

			$scope.showPhysModal = !$scope.showPhysModal ;

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
			physical_records_fac.add($scope.patient, pRecord);
		};

		$scope.submitPhysicalRecord = function()
		{

			if($scope.mode == 'create'){
				physical_records_fac.add($scope.patient, $scope.physicalRecord);
			}

			else if($scope.mode == 'edit')
			{
				physical_records_fac.update($scope.patient, $scope.physicalRecord);
			}

			$scope.showPhysModal = !$scope.showPhysModal ;
		};

		$scope.removePhysicalRecord = function(pRecord, index){
			if(confirm("Confirm na kub") ){
				physical_records_fac.delete($scope.patient, pRecord, index);
			}
		};


		// MEDICAL RECORD
		$scope.showMedModal = false;
		$scope.showAddDiseaseModal = false;
		$scope.diseaseIdOptions = [ 'ICD10', 'SNOMED', 'DRG' ];
		$scope.showMedicalRecordForm = function(mode,medRecord){
			$scope.mode = mode;

			if(mode == 'edit'){
				$scope.medicalRecord = {};
				angular.copy(medRecord, $scope.medicalRecord);
			}else if(mode == 'create'){
				$scope.medicalRecord = {};
				$scope.medicalRecord.diseases = [];
			};
			$scope.showMedModal = !$scope.showMedModal;
		}


		$scope.showAddDisease = function(mode, disease)
		{
			$scope.addDiseaseMode = mode;
			if(mode == 'edit')
			{
				$scope.disease = disease;
			}
			else if(mode == 'create')
			{
				$scope.disease = {};
			}
			$scope.showAddDiseaseModal = !$scope.showAddDiseaseModal;
		};


		$scope.submitAddDisease = function()
		{
			$scope.showAddDiseaseModal = !$scope.showAddDiseaseModal;
			if($scope.addDiseaseMode == 'create')
			{
				$scope.medicalRecord.diseases.push($scope.disease);
			}
			else if($scope.addDiseaseMode == 'edit')
			{
				for(var i = 0; i < $scope.medicalRecord.diseases.length; i++)
				{
					if(i == idx)
					{
						var disease = $scope.medicalRecord.diseases[i];
						disease.disease_id_type = $scope.disease.disease_id_type;
						disease.disease_id = $scope.disease_id;
						disease.name = $scope.disease.name;
						break;
					}
				}
			}
		}

		$scope.removeDisease = function(index)
		{
			for(var i = 0; i < $scope.medicalRecord.diseases.length; i++)
			{
				if(i == index) {
					$scope.medicalRecord.diseases.splice(i,1) ;
					break;
				}
			}
		}

		$scope.generateMedicalRecord = function()
		{
			/*var pRecord = {
				weight: Math.floor(Math.random()*50 + 50),
				height: Math.floor(Math.random()*70 + 120),
				blood_pressure: Math.floor(Math.random()*50 + 100),
				pulse: Math.floor(Math.random()*30 + 30),
				temperature: Math.floor(Math.random()*5 + 35)
			};
			console.log(pRecord);
			patients_fac.addPhysicalRecord($scope.patient, pRecord);*/
		};

		$scope.submitMedicalRecord = function()
		{

			if($scope.mode == 'create'){
				medical_records_fac.add($scope.patient, $scope.medicalRecord);
			}

			else if($scope.mode == 'edit')
			{
				medical_records_fac.update($scope.patient, $scope.medicalRecord);
			}

			$scope.showMedModal = !$scope.showMedModal ;
		};

		$scope.removeMedicalRecord = function(medRecord, index){
			if(confirm("Are you sure?") ){
				medical_records_fac.delete($scope.patient, medRecord, index);
			}
		};

	}
]);

app.directive('modal', function () {
    return {
      template: '<div class="modal fade">' +
          '<div class="modal-dialog">' +
            '<div class="modal-content">' +
              '<div class="modal-header">' +
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                '<h4 class="modal-title">{{ title }}</h4>' +
              '</div>' +
              '<div class="modal-body" ng-transclude></div>' +
            '</div>' +
          '</div>' +
        '</div>',
      restrict: 'E',
      transclude: true,
      replace:true,
      scope:true,
      link: function postLink(scope, element, attrs) {
        scope.title = attrs.title;

        scope.$watch(attrs.visible, function(value){
          if(value == true)
            $(element).modal('show');
          else
            $(element).modal('hide');
        });

        $(element).on('shown.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = true;
          });
        });

        $(element).on('hidden.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = false;
          });
        });
      }
    };
  });

})();
