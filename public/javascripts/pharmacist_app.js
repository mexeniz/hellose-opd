(function(){
var app = angular.module('pharmacist', ['ui.router', 'ngMaterial','md.data.table']) ;
// Angular Material Config
app.config(function($mdThemingProvider){

  $mdThemingProvider.theme('default')
      .primaryPalette('yellow')
      .accentPalette('lime') //cyan 100
      .warnPalette('red');

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

		o.getPatientUser = function(patient_id) {
			return $http.get('/patients/info_user/' +patient_id);
		};
	  return o;
	}]);
app.factory('prescriptions_fac', ['$http', function($http){
	  var o = {
	  	prescriptions : []
	  };
	  
	  o.getList = function(){
	  	return $http.get('prescriptions/list').success(function(data){
	      for(var i = 0  ; i < data.length  ; i++){
					o.prescriptions.push(data[i]);
					console.log(o.prescriptions[o.prescriptions.length-1]);
				}
	    });
	  };

	  o.complete = function(prescription){
	  	return $http.post('complete/' + prescription._id).success(function(){
			for(var i = 0  ; i < o.prescriptions.length  ; i++){
					if(prescription._id === o.prescriptions[i]._id){
						o.prescriptions[i].status = 'Completed';
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
		};

	  return o;
	}]);

app.controller('ListCtrl', [
	'$scope',
	'$q',
	'prescriptions_fac',
	'$mdDialog',
	'$http',

	function($scope,$q, prescriptions_fac,$mdDialog,$http){
		prescriptions_fac.getList();
		$scope.prescriptions = prescriptions_fac.prescriptions;
	    $scope.selected = [];
	  
	      $scope.query = {
	       order: 'username',
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

		// Custom Filter by Full Name
		$scope.fullnameFilterItem = {
			store : ''
		};

		$scope.fullnameFilter = function(data){
			console.log(data);
			var fullname = (data.patient.userId.firstname + " " + data.patient.userId.lastname).toLowerCase();
			return fullname.indexOf($scope.fullnameFilterItem.store.trim().toLowerCase()) !== -1;
		};

		// Custom Filter by Status
		$scope.statusFilterOption = {
			stores : [
				{id : 0, name : 'ทั้งหมด'},
				{id : 1, name : 'รอการจ่าย'},
				{id : 2, name : 'จ่ายแล้ว'}
			]
		};

		$scope.statusFilterItem = {
			store : $scope.statusFilterOption.stores[0]
		};

		$scope.statusFilter = function(data){
			if ($scope.statusFilterItem.store.id === 0) {
		    	return true;
		    } else if(data.status === $scope.statusFilterItem.store.name){
				return true;
			}else {
		    	return false;
		  	}
		};
	  	$scope.isOpen = false ;
		$scope.showPresDetail = function(ev,p){
		   var detailCtrl = function($scope,prescription,prescriptionList , http){
		      	$scope.prescriptionList = prescriptionList;
		      	$scope.prescription = prescription ;
			    for (var i = 0 ; i < prescription.med_dosage_list.length ; i++){
		      		console.log($scope.prescription.med_dosage_list); 
			    	$http.get('/medicines/name/'+prescription.med_dosage_list[i]._id).success(function(data){
					    console.log("Debug");
					    console.log(data);
			    		$scope.prescription.med_dosage_list[i].name = data.name ;
			    	});
			    }
		      	console.log("22222");
		         $scope.cancel = function() {
		            $mdDialog.cancel();
		        };
		        $scope.completePrescription = function(prescription){
				// update in db
				$http.post('/prescriptions/complete/' + prescription._id).success(function(){
					for(var i = 0  ; i < $scope.prescriptionList.length  ; i++){
							if(prescription._id === $scope.prescriptionList[i]._id){
								$scope.prescriptionList[i].status = 'จ่ายแล้ว';
							}
						}
						$mdDialog.cancel();
			  		});
		      	};
		      };
			$mdDialog.show({
	        locals:{prescription : p , prescriptionList : $scope.prescriptions , http : $http},
	        controller: detailCtrl,
	        templateUrl: '/dialog/prescriptionDetailPharm.html',
	        parent: angular.element(document.body),
	        targetEvent: ev,
	        clickOutsideToClose:true
	      })
	      .then(function(answer) {
	        //Do something after close dialog
	        //Switch to another page
	      }, function() {
	      });
		

		};
	}
]);


app.controller('InfoCtrl', [
	'$scope',
	'patients_fac',
	'prescriptions_fac',
	'medicines_fac',
	'$q',
	'$mdDialog',
	'$http',
	function($scope, patients_fac, prescriptions_fac,medicines_fac,$q,$mdDialog,$http){
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

		$scope.queryPres = {
	 	   order: 'p.date',
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


		// PRESCRIPTION RECORD
		$scope.prescription = {}; // Hold prescription form value (temp)

		$scope.showPresForm = function(mode, prescription) {
			
			$scope.mode = mode;

			if(mode === 'create')
			{
				// Reset form
				$scope.prescription = {};
				$scope.prescription.med_dosage_list = [];
			}
			else if(mode === 'edit')
			{
				// Copy it to form
				angular.copy(prescription, $scope.prescription);
			}
			else
			{
				console.error('showPresForm: mode ' + mode + " not found!");
			}
			

			$scope.showPresModal = true;
		};


		medicines_fac.getMedicineList() ;
		$scope.medicineList = medicines_fac.medicineList;

		/////////////////////////////
		// Prescription Detail Tab //
		/////////////////////////////
		$scope.allergy = ['Yakult' , 'Amphet' , 'Wappa' ];

		$scope.showPresDetail = function(ev,prescription){
		   var detailCtrl = function($scope,prescription,prescriptionList){
		   		console.log(prescriptionList);
		      	$scope.prescriptionList = prescriptionList;
		      	$scope.prescription =prescription ;
		         $scope.cancel = function() {
		            $mdDialog.cancel();
		        };
		        $scope.completePrescription = function(prescription){
				// update in db
				$http.post('/prescriptions/complete/' + prescription._id).success(function(){
					for(var i = 0  ; i < $scope.prescriptionList.length  ; i++){
							if(prescription._id === $scope.prescriptionList[i]._id){
								$scope.prescriptionList[i].status = 'จ่ายแล้ว';
							}
						}
						$mdDialog.hide();
			  		});
		      	};
		      };
			$mdDialog.show({
	        locals:{prescription : prescription , prescriptionList : $scope.patient.prescription_record},
	        controller: detailCtrl,
	        templateUrl: '/dialog/prescriptionDetailPharm.html',
	        parent: angular.element(document.body),
	        targetEvent: ev,
	        clickOutsideToClose:true
	      })
	      .then(function(answer) {
	        //Do something after close dialog
	        //Switch to another page
	      }, function() {
	      });
		

		};
	}
]);

app.controller('InfoUserCtrl', [
	'$scope',
	'patients_fac',
	'$mdDialog',
	'$q',
	function($scope, patients_fac,  prescription_records_fac, $mdDialog,$q){
      	$scope.bloodList = ["A","B","AB","O"];
		$scope.genderList = [{abb:"M",gen:"ชาย"},{abb:"F",gen:"หญิง"}];
		$scope.init = function(patient_id) {
			// Get patient info
			$scope.patient_id = patient_id;
			patients_fac.getPatientUser($scope.patient_id).success(function(data){
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

