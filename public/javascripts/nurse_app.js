(function(){
var app = angular.module('nurse', ['ui.router', 'ngMaterial', 'materialCalendar', 'ngCsvImport' ,'md.data.table']) ;

// Angular Material Config
app.config(function($mdThemingProvider, $mdIconProvider){

                      $mdThemingProvider.theme('default')
                          .primaryPalette('blue')
                          .accentPalette('light-blue')
                          .warnPalette('deep-orange');

              });

// Side menu controller
app.controller('menuCtrl', function($scope, $mdSidenav) {
                $scope.toggleNav = function(compId)
                {
                  $mdSidenav(compId).toggle();
                };
              });


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
		};

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
		};
	  o.update = function(patient, pRecord)
		{
			return $http.put('/records/physical/update/'+ pRecord._id , pRecord).success(function(data){
		    for(var i = 0; i < patient.physical_record.length; i++)
				{
					if(patient.physical_record[i]._id === data._id)
					{
						patient.physical_record[i] = data;
					}
				}
			});
		};

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
			console.log(medRecord.diseases.length);
			if(medRecord.diseases.length > 0){newMedRecord.diseases = [];}
			for(var i = 0; i < medRecord.diseases.length; i++)
			{
				console.log(medRecord.diseases[i]._id);
				newMedRecord.diseases.push(medRecord.diseases[i]._id);
			}

			return $http.post('/records/medical/insert/'+ patient._id , newMedRecord).success(function(data){
					// If succeeded, push it to display
		    	patient.medical_record.push(data);
			});
		};

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
						if(patient.medical_record[i]._id === data._id)
						{
							patient.medical_record[i] = data;
						}
					}
			});
		};

		o.delete = function(patient, medRecord, index) {
			return $http.delete('/records/medical/delete/' + patient._id + '/' + medRecord._id).success(function() {
				// If succeeded, delete it from view
				patient.medical_record.splice(index,1);
			});
	  };

		o.searchDisease = function(id_type, keyword, diseaseData)
		{

			return $http.get('/diseases/list/', keyword).success(function(data) {
				diseaseData = data;
			});
		};

		o.getDiseaseList = function(id_type, diseaseData)
		{
			return $http.get('/diseases/listByIdType/' + id_type).success(function(data) {
				angular.copy(data, diseaseData);
			});
		};

	  return o;
	}]);


app.factory('prescription_records_fac', ['$http', function($http){
	  	var o = {};
	  	// Use Route! Connect to backend and retrieve data

	  	o.add = function(patient, prescription)
		{

			return $http.post('/prescriptions/insert/'+ patient._id , prescription).success(function(data){
					// If succeeded, push it to display
		    	patient.prescription_record.push(data);
			});
		};

	  	o.update = function(patient, prescription)
		{

			return $http.put('/prescriptions/update/'+ prescription._id , prescription).success(function(data){
					for(var i = 0; i < patient.prescription_record.length; i++)
					{
						if(patient.prescription_record[i]._id === data._id)
						{
							patient.prescription_record[i] = data;
						}
					}
			});
		};

		o.delete = function(patient, prescription) {
			return $http.delete('/prescriptions/delete/' + prescription._id).success(function() {
				// If succeeded, delete it from view
				for(var i = 0; i < patient.prescription_record.length; i++)
				{
					if(patient.prescription_record[i]._id === prescription._id)
					{
						patient.prescription_record.splice(i, 1);
					}
				}
			});
	  	};


	  return o;
	}]);

app.factory('medicines_fac', ['$http', function($http){
	  var o = {
	  	medicineList: []
	  };

		o.getMedicineList = function()
		{
			return $http.get('/medicines/all').success(function(data) {
				angular.copy(data, o.medicineList);
			});
			/*var medicineList = [];
			if(medicineList.length === 0) // Load medicine data from server if not loaded yet
			{
				medicineList = [ { _id: 'A', name: 'Yakult' },
							{ _id: 'B', name: 'Brand' } ];
			}
			
			angular.copy(medicineList, o.medicineList);*/

		};

	  return o;
	}]);

app.factory('schedule_fac', ['$http', function($http){
	  var o = {
	  	schedule : []
	  };
	  
	  o.create = function(schedule) {
		  return $http.post('/appointment/importRoundward', schedule).success(function(data){
		    o.schedule.push(data);
		    console.log(o.schedule);
			});
	  };
	  return o;
	}]);

//Patient List controller
app.controller('ListCtrl', [
	'$scope',
	'$q',
	'patients_fac',
	'$timeout',
	function($scope,$q, patients_fac,$timeout){
		patients_fac.getList();
		$scope.patients = patients_fac.patients;
		$scope.selected = [];
  
	  	$scope.query = {
	 	   order: 'patient_id',
	 	   limit: 10,
		    page: 1
		};

		$scope.onpagechange = function(page, limit) {
		    var deferred = $q.defer();
		    
		    setTimeout(function () {
		      deferred.resolve();
		    }, 2000);
		    
		    return deferred.promise;
		  };
	  
		$scope.onorderchange = function(order) {
		    var deferred = $q.defer();
		    
		    setTimeout(function () {
		      deferred.resolve();
		    }, 2000);
		    
		    return deferred.promise;
		  };

		  //Filter
		 $scope.fullnameOrIdFilterItem = {
			store : ''
		};

		$scope.fullnameOrIdFilter = function(data){
			var fullname = (data.userId.firstname + " " + data.userId.lastname).toLowerCase();
			var input = $scope.fullnameOrIdFilterItem.store.trim().toLowerCase();
			return fullname.indexOf(input) !== -1 || data.patient_id.indexOf(input) !== -1;
		};
	}
]);
app.controller('InfoCtrl', [
	'$scope',
	'patients_fac',
	'physical_records_fac',
	'medical_records_fac',
	'prescription_records_fac',
	'medicines_fac',
	'$mdDialog',
	'$q',
	function($scope, patients_fac, physical_records_fac, medical_records_fac, prescription_records_fac, medicines_fac,$mdDialog,$q){
      	$scope.bloodList = ["A","B","AB","O"];
		$scope.genderList = [{abb:"M",gen:"ชาย"},{abb:"F",gen:"หญิง"}];
		$scope.init = function(patient_id) {
			// Get patient info
			$scope.patient_id = patient_id;
			patients_fac.getPatient($scope.patient_id).success(function(data){
				var obj_id = data._id ; 
				$scope.patient = data.userId;
				$scope.patient.blood_type = data.blood_type;
				$scope.patient.patient_id = data.patient_id;
				$scope.patient.physical_record = data.physical_record ;
				$scope.patient.medical_record = data.medical_record ;
				$scope.patient.prescription_record = data.prescription_record ;
				$scope.patient._id = obj_id ; 
				
				$scope.patient.birthdate = new Date(data.userId.birthdate);

				$scope.patient.age = (function(){
			    	// var ageDifMs = Date.now() - $scope.patient.birthdate.getTime();
				    // var ageDate = new Date(ageDifMs); // miliseconds from epoch
				    return (new Date().getFullYear() - $scope.patient.birthdate.getFullYear());
				    // return Math.abs(ageDate.getUTCFullYear() - 1970);
			    }());

				// console.log(data);
		    });
		};

		$scope.showPhysicalRecordForm = function(ev,mode,physicalRecord){

			var createPhysCtrl = function($scope ,physicalRecord){
				$scope.physicalRecord = {} ;
		        $scope.cancel = function() {
		            $mdDialog.cancel();
		        };
		        $scope.submitPhysicalRecord = function(){
		        	if ($scope.physicalRecord.weight != null &&
		        		$scope.physicalRecord.height != null &&
		        		$scope.physicalRecord.temperature != null &&
		        		$scope.blood_pressure_sys != null &&
		        		$scope.blood_pressure_di != null &&
		        		$scope.physicalRecord.pulse != null ){
		        	$scope.physicalRecord.blood_pressure = $scope.blood_pressure_sys+"/"+$scope.blood_pressure_di;

					$mdDialog.hide({mode :'create',physicalRecord : $scope.physicalRecord});
				}
		      	};
		      };
		    var editPhysCtrl = function($scope ,physicalRecord){
				$scope.physicalRecord = {
		    		_id : physicalRecord._id ,
		    		weight : physicalRecord.weight ,
		        	height : physicalRecord.height ,
		        	temperature : physicalRecord.temperature ,
		        	pulse : physicalRecord.pulse
		    	};
		    	var b = physicalRecord.blood_pressure.split('/');
				$scope.blood_pressure_sys = Number(b[0]) ;
				$scope.blood_pressure_di = Number(b[1]) ;
		        $scope.cancel = function() {
		            $mdDialog.cancel();
		        };
		        $scope.submitPhysicalRecord = function(){
		        	if ($scope.physicalRecord.weight !== null &&
		        		$scope.physicalRecord.height !== null &&
		        		$scope.physicalRecord.temperature !== null &&
		        		$scope.blood_pressure_sys !== null &&
		        		$scope.blood_pressure_di !== null &&
		        		$scope.physicalRecord.pulse !== null ){
		        	$scope.physicalRecord.blood_pressure = $scope.blood_pressure_sys+"/"+$scope.blood_pressure_di;
					$mdDialog.hide({mode :'edit',physicalRecord : $scope.physicalRecord});
					}
		      	};
		      };
		    var pCtrl = {};
		    if (mode === 'edit'){
		    	pCtrl = editPhysCtrl ;
		    }
		    else{
		    	pCtrl = createPhysCtrl ;
		    }

		    //Copy value
		    

			$mdDialog.show({
	        locals:{physicalRecord : physicalRecord},
	        controller: pCtrl,
	        templateUrl: '/dialog/createPhysicalRecord.html',
	        parent: angular.element(document.body),
	        targetEvent: ev,
	        clickOutsideToClose:true
	      })
	      .then(function( response ) {
	        if(response.mode === "create"){
	        	physical_records_fac.add($scope.patient, response.physicalRecord);
	        }
	        else if (response.mode === "edit"){
				physical_records_fac.update($scope.patient, response.physicalRecord);
	        }
	      });

		};
		$scope.submitPhysicalRecord = function()
		{

			if($scope.mode === 'create'){
				physical_records_fac.add($scope.patient, $scope.physicalRecord);
			}

			else if($scope.mode === 'edit')
			{
				physical_records_fac.update($scope.patient, $scope.physicalRecord);
			}

			$scope.showPhysModal = !$scope.showPhysModal ;
		};

		$scope.removePhysicalRecord = function(pRecord, index){
			if(confirm("Are you sure?") ){
				physical_records_fac.delete($scope.patient, pRecord, index);
			}
		};

		//Pagination Function
		$scope.query = {
	 	   order: 'physicalRecord.date',
	 	   limit: 10,
		    page: 1
		};

		$scope.onpagechange = function(page, limit) {
		    var deferred = $q.defer();
		    
		    setTimeout(function () {
		      deferred.resolve();
		    }, 2000);
		    
		    return deferred.promise;
		  };
	  
		$scope.onorderchange = function(order) {
		    var deferred = $q.defer();
		    
		    setTimeout(function () {
		      deferred.resolve();
		    }, 2000);
		    
		    return deferred.promise;
		  };
	}
	
]);
})();
