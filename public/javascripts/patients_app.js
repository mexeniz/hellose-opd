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
	  o.updatePhysicalRecord = function(pRecord)
		{
			return $http.put('/records/physical/update/'+ pRecord._id , pRecord).success(function(data){
		    patient.physical_record.push(data);
			});
		}

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
		$scope.showPhysModal = false;
		$scope.showPhysicalRecordForm = function(mode,pRecord){
			console.log($scope.showPhysModal);
			$scope.mode = mode;
			console.log($scope.mode);
			console.log(this);
			console.log(pRecord);
			if(mode == 'edit'){
				$scope.id = pRecord._id;
				$scope.weight = pRecord.weight;
				$scope.height = pRecord.height;
				$scope.blood_pressure = pRecord.blood_pressure;
				$scope.pulse = pRecord.pulse;
				$scope.temperature = pRecord.temperature;
			}else if(mode == 'create'){
				$scope.weight = '';
				$scope.height = '';
				$scope.blood_pressure = '';
				$scope.pulse = '';
				$scope.temperature = '';
			};
			$scope.showPhysModal = !$scope.showPhysModal ;
			console.log("after "+$scope.showPhysModal);
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

		$scope.submitPhysicalRecord = function()
		{
			var pRecord = {
				_id: this.id,
				weight: this.weight,
				height: this.height,
				blood_pressure: this.blood_pressure,
				pulse: this.pulse,
				temperature: this.temperature
			};
			console.log(pRecord);
			if($scope.mode == 'create'){
				patients_fac.addPhysicalRecord($scope.patient, pRecord);
			}else if($scope.mode == 'edit'){
				records_fac.updatePhysicalRecord(pRecord);
				for(var i = 0 ; i < $scope.patient.physical_record.length ; i++ ){
					if($scope.patient.physical_record[i]['_id'] == pRecord._id){
						var date = $scope.patient.physical_record[i]['date'];
						$scope.patient.physical_record[i] = pRecord;
						$scope.patient.physical_record[i]['date'] = date;
					}
				}
				this.id = '';
				this.weight = '';
				this.height = '';
				this.blood_pressure = '';
				this.pulse = '';
				this.temperature = '';
			}
			$scope.showPhysModal = !$scope.showPhysModal ;
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


		// MEDICAL RECORD
		$scope.showMedModal = false;
		$scope.diseaseIdOptions = [ 'ICD10', 'SNOMED', 'DRG' ];
		$scope.showMedicalRecordForm = function(mode,pRecord){
			console.log($scope.showMedModal);
			$scope.mode = mode;
			console.log($scope.mode);
			console.log(this);
			console.log(pRecord);
			if(mode == 'edit'){
				/*$scope.id = pRecord._id;
				$scope.weight = pRecord.weight;
				$scope.height = pRecord.height;
				$scope.blood_pressure = pRecord.blood_pressure;
				$scope.pulse = pRecord.pulse;
				$scope.temperature = pRecord.temperature;*/
			}else if(mode == 'create'){
				/*$scope.weight = '';
				$scope.height = '';
				$scope.blood_pressure = '';
				$scope.pulse = '';
				$scope.temperature = '';*/
			};
			$scope.showMedModal = !$scope.showMedModal ;
			console.log("after "+$scope.showMedModal);
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
			/*var pRecord = {
				_id: this.id,
				weight: this.weight,
				height: this.height,
				blood_pressure: this.blood_pressure,
				pulse: this.pulse,
				temperature: this.temperature
			};
			console.log(pRecord);
			if($scope.mode == 'create'){
				patients_fac.addPhysicalRecord($scope.patient, pRecord);
			}else if($scope.mode == 'edit'){
				records_fac.updatePhysicalRecord(pRecord);
				for(var i = 0 ; i < $scope.patient.physical_record.length ; i++ ){
					if($scope.patient.physical_record[i]['_id'] == pRecord._id){
						var date = $scope.patient.physical_record[i]['date'];
						$scope.patient.physical_record[i] = pRecord;
						$scope.patient.physical_record[i]['date'] = date;
					}
				}
				this.id = '';
				this.weight = '';
				this.height = '';
				this.blood_pressure = '';
				this.pulse = '';
				this.temperature = '';
			}*/
			$scope.showMedModal = !$scope.showMedModal ;
		};

		$scope.removeMedicalRecord = function(patid, physid ){
			if(confirm("Confirm na kub") ){
				/*records_fac.deletePhysicalRecord(patid, physid);
				for(var i = 0 ; i < $scope.patient.physical_record.length ; i++ ){
					if($scope.patient.physical_record[i]['_id'] == physid){
						$scope.patient.physical_record.splice(i,1) ;
					}
				}*/
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
