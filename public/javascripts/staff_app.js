(function(){
var app = angular.module('staff', ['ui.router', 'ngMaterial', 'materialCalendar', 'ngCsvImport' ,'md.data.table']) ;

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
	  o.update = function(patient ,editedPatient) {
	  		console.log("test update");
	  		patient.firstname = editedPatient.firstname;
	  		patient.lastname = editedPatient.lastname;
	  		patient.birthdate = editedPatient.birthdate;
	  		patient.gender = editedPatient.gender;
	  		patient.blood_type = editedPatient.blood_type;
	  		patient.ssn = editedPatient.ssn;
	  		patient.email = editedPatient.email;
	  		patient.telNum = editedPatient.telNum;
	  		patient.address = editedPatient.address;
		  /*return $http.put('/patients/updateProfile/'+editedPatient.user_id, patient).success(function(data){
		    	o.patients.push(data);
			});*/
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
	 	   limit: 5,
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

//Controller for Patient Profile
app.controller('InfoCtrl', [
	'$scope',
	'patients_fac',
	'$mdDialog',
	'$http',
	function($scope, patients_fac,$mdDialog,$http){
      	$scope.bloodList = ["A","B","AB","O"];
		$scope.genderList = [{abb:"M",gen:"ชาย"},{abb:"F",gen:"หญิง"}];
		$scope.init = function(patient_id) {
			// Get patient info
			$scope.patient_id = patient_id;
			patients_fac.getPatient($scope.patient_id).success(function(data){
				var obj_id = data._id ; 
				var user_id = data.userId._id ; 
				$scope.patient = data.userId;
				$scope.patient.blood_type = data.blood_type;
				$scope.patient.patient_id = data.patient_id;
				$scope.patient._id = obj_id ; 
				$scope.patient.user_id = user_id ;
				$scope.patient.birthdate = new Date(data.userId.birthdate);

				$scope.patient.age = (function(){
			    	// var ageDifMs = Date.now() - $scope.patient.birthdate.getTime();
				    // var ageDate = new Date(ageDifMs); // miliseconds from epoch
				    return (new Date().getFullYear() - $scope.patient.birthdate.getFullYear());
				    // return Math.abs(ageDate.getUTCFullYear() - 1970);
			    }());
		    });
		};
		$scope.showEditProfile = function(ev){
			var editCtrl = function($scope,patient){
		      	$scope.cancel = function() {
			         $mdDialog.cancel();
			    };
		      	$scope.patient = patient;
		      	$scope.bloodList = ["A","B","AB","O"];
	    		$scope.genderList = [{abb:"M",gen:"ชาย"},{abb:"F",gen:"หญิง"}];
		      	console.log("Update profile!");
		      	$scope.submitProfile = function(){
		        	if ($scope.patient.firstname !== null &&
		        		$scope.patient.lastname !== null &&
		        		$scope.patient.gender !== null &&
		        		$scope.patient.email !== null &&
		        		$scope.patient.address !== null &&
		        		$scope.patient.ssn !== null &&
		        		$scope.patient.blood_type !== null &&
		        		$scope.patient.birthdate !== null &&
		        		$scope.patient.tel_number !== null
		        		){
							$mdDialog.hide($scope.patient);}
		      	};
		      $scope.updateProfile = function(){	
	        	console.log(patient);
		      };
		    };
		//Copy important value (User model)
		var editedPatient = {
			_id : $scope.patient.user_id,
			firstname : $scope.patient.firstname,
			lastname : $scope.patient.lastname,
			ssn : $scope.patient.ssn ,
			email : $scope.patient.email ,
			birthdate : $scope.patient.birthdate ,
			telNum : $scope.patient.telNum ,
			address : $scope.patient.address, 
			gender : $scope.patient.gender, 
			blood_type : $scope.patient.blood_type 
		};

		$mdDialog.show({
	        locals:{patient: editedPatient},
	        controller: editCtrl,
	        templateUrl: '/dialog/editProfile.html',
	        parent: angular.element(document.body),
	        targetEvent: ev,
	        clickOutsideToClose:true
	      })
	      .then(function(editedPatient) {
	      	$scope.patient.age = function(){
				    return (new Date().getFullYear() - editedPatient.birthdate.getFullYear());
			};
	        patients_fac.update($scope.patient , editedPatient);
	      }, function() {

	      });

	    } 	;
	}
	
]);

//Staff

//Importing CSV Here
app.controller('ImportCtrl', [	'$scope', '$parse', 'schedule_fac',
		function($scope,$parse,schedule_fac){

			$scope.csv = {
					content: null,
				header: true,
				headerVisible: false,
				separator: ',',
				separatorVisible: false,
				result: 'json.result',
				encoding: 'ISO-8859-1',
				encodingVisible: false,
			};

			$scope.monthList = [];

			$scope.yearList = [];



			$scope.init = function()
			{
				var currentDate = new Date();
				$scope.startYear = currentDate.getFullYear();
				$scope.monthList = [
					{
						value: 1,
						msg: 'มกราคม'
					},
					{
						value: 2,
						msg: 'กุมภาพันธ์'
					},
					{
						value: 3,
						msg: 'มีนาคม'
					},
					{
						value: 4,
						msg: 'เมษายน'
					},
					{
						value: 5,
						msg: 'พฤษภาคม'
					},
					{
						value: 6,
						msg: 'มิถุนายน'
					},
					{
						value: 7,
						msg: 'กรกฎาคม'
					},
					{
						value: 8,
						msg: 'สิงหาคม'
					},
					{
						value: 9,
						msg: 'กันยายน'
					},
					{
						value: 10,
						msg: 'ตุลาคม'
					},
					{
						value: 11,
						msg: 'พฤศจิกายน'
					},
					{
						value: 12,
						msg: 'ธันวาคม'
					}
				];
				for(var i = $scope.startYear; i < $scope.startYear + 10; i++)
				{
					$scope.yearList.push(i);
				}

				$scope.year = $scope.startYear;
				$scope.month = currentDate.getMonth();
			};

			
			$scope.genMes = function(){
					var year_input = $scope.year;
					var months_input = $scope.month;
					var jsondata = {};
					jsondata = {'month': months_input , 'year' : year_input , data :$scope.csv.result };
					//Parse to Backend
					schedule_fac.create(jsondata);
			};

		}]);

})();
