(function(){
var app = angular.module('doctor', ['ui.router', 'ngMaterial', 'materialCalendar'  ,'md.data.table']) ;

// Angular Material Config
app.config(function($mdThemingProvider){

                      $mdThemingProvider.theme('default')
                          .primaryPalette('light-green')
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
	  o.update = function(patient)
	{
		return $http.put('/patients/update/'+ patient._id , patient).success(function(data){
				console.log(data);
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
			if(medRecord.diseases.length > 0){
				newMedRecord.diseases = [];
			}
			for(var i = 0; i < medRecord.diseases.length; i++)
			{
				//newMedRecord.diseases.push(medRecord.diseases[i]._id);
				// Just keep text
				newMedRecord.diseases.push(medRecord.diseases[i].name);
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
				//newMedRecord.diseases.push(medRecord.diseases[i]._id);
				// Just keep text
				newMedRecord.diseases.push(medRecord.diseases[i].name);
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

app.factory('appointment_fac', ['$http', function($http){
	var o = {
		appointmentList: [],
		busyDate: []
	};

	o.getCalendar = function(month, year, callback)
	{
		/*var bd = [];
		angular.copy(bd, o.busyDate);
		o.busyDate.push(Math.floor(Math.random() * 28) + 1);
		o.busyDate.push(Math.floor(Math.random() * 28) + 1);
		o.busyDate.push(Math.floor(Math.random() * 28) + 1);
		o.busyDate.push(Math.floor(Math.random() * 28) + 1);*/
		$http.get('/appointment/list/' + year + '/' + month)
		.success(function(data){
			angular.copy(data, o.appointmentList);
			console.log(data);
			callback();
		})
		.error(function(err){

		});
	};

	o.getAppointmentListByDate = function(date)
	{
		console.log('appointment_fac getAppointmentListByDate ' + date);
		var appList = [
			{
				_id: 0, time: '9.30', patient: 'ติวเคอร์ อิอิ', symptom: 'หิวๆๆๆๆๆ'
			},
			{
				_id: 1, time: '10.30', patient: 'ติวเคอร์ อิอิ', symptom: 'หิวๆๆๆๆๆ'
			},
			{
				_id: 2, time: '11.30', patient: 'ติวเคอร์ อิอิ', symptom: 'หิวๆๆๆๆๆ'
			},
			{
				_id: 3, time: '12.30', patient: 'ติวเคอร์ อิอิ', symptom: 'หิวๆๆๆๆๆ'
			},
			{
				_id: 4, time: '13.30', patient: 'ติวเคอร์ อิอิ', symptom: 'หิวๆๆๆๆๆ'
			}
		];

		angular.copy(appList, o.appointmentList);
	};

  	return o;
}]);

app.factory('roundward_fac', ['$http', '$timeout', function($http, $timeout){
	var o = {
		roundwardList: [],
		roundwardCache: {}
	};

	var getKey = function(date, time)
	{
		return date.getDate() + ' ' + date.getMonth() + ' ' + date.getFullYear() + ' ' + time;
	};

	o.getCalendar = function(month, year, callback)
	{
		console.log('Getting calendar ' + year + ' ' + month);
		/*var rwList = [
			{_id: 0, date: new Date(year, month, 1, 0, 0, 0, 0), time: 'AM'},
			{_id: 1, date: new Date(year, month, 2, 0, 0, 0, 0), time: 'AM'},
			{_id: 2, date: new Date(year, month, 3, 0, 0, 0, 0), time: 'PM'},
			{_id: 3, date: new Date(year, month, 4, 0, 0, 0, 0), time: 'AM'},
			{_id: 4, date: new Date(year, month, 4, 0, 0, 0, 0), time: 'PM'}
		];*/
		

		$http.post('/getRoundward', { month: month, year: year }).success(function(rwList){
			
			for(var i in rwList)
			{
				var roundward = rwList[i];
				roundward.date = new Date(roundward.date);
				var key = getKey(roundward.date, roundward.time);
				o.roundwardCache[key] = roundward;
			}

			angular.copy(rwList, o.roundwardList);
			


			console.log(o.roundwardList);
			callback();
		});

		/*$timeout(function() {
			angular.copy(rwList, o.roundwardList);
			
			for(var i in rwList)
			{
				var roundward = rwList[i];
				var key = getKey(roundward.date, roundward.time);
				o.roundwardCache[key] = roundward;
			}

			console.log(o.roundwardList);
			callback();
		},2000);*/
		
	};

	o.getRoundwardCache = function(date, time)
	{
		var key = getKey(date, time);
		return o.roundwardCache[key];
	};

	o.addRoundward = function(date, time, callback)
	{
		/*var rwInfo = {
			_id: o.roundwardList.length + 1,
			date: date,
			time: time
		};*/
		$http.post('/addRoundward', { date: date, time: time }).success(function(data)
		{
			data.date = new Date(data.date);
			console.log('added roundward');
			console.log(data);
			o.roundwardList.push(data);
			o.roundwardCache[getKey(data.date, data.time)] = data;
			callback(data.date);
		});

		/*$timeout(function() {
			console.log('added roundward');
			console.log(rwInfo);
			o.roundwardList.push(rwInfo);
			o.roundwardCache[getKey(rwInfo.date, rwInfo.time)] = rwInfo;
			callback(date);
		},2000);*/
	};

	o.cancelRoundward = function(rwId, callback)
	{

		$http.post('/cancelRoundward', { rwId: rwId }).success(function(data)
		{
			for(var i in o.roundwardList)
			{
				var rw = o.roundwardList[i];
				if(rw._id === rwId)
				{
					console.log('deleted roundward id = ' + rwId);
					o.roundwardList.splice(i, 1);
					o.roundwardCache[getKey(rw.date, rw.time)] = null;
					callback(rw);
					return;
				}
			}

		});

		/*$timeout(function() {
			

			for(var i in o.roundwardList)
			{
				var rw = o.roundwardList[i];
				if(rw._id === rwId)
				{
					console.log('deleted roundward id = ' + rwId);
					o.roundwardList.splice(i, 1);
					o.roundwardCache[getKey(rw.date, rw.time)] = null;
					callback(rw);
					return;
				}
			}

			
		},2000);*/
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
	'prescription_records_fac',
	'medicines_fac',
	'$q',
	'$mdDialog',
	'$http',
	function($scope, patients_fac, physical_records_fac, medical_records_fac, prescription_records_fac, medicines_fac,$q,$mdDialog,$http){
		$scope.init = function(patient_id , user_id) {
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

				//Get Doctor
				$http.get('/user/fullname/'+user_id).success(function(data){
					$scope.doctorName = data.fullname ;
					console.log($scope.doctorName) ;
				});
		    });
		};

		//Pagination Function
		$scope.queryPhys = {
	 	   order: 'physicalRecord.date',
	 	   limit: 10,
		    page: 1
		};
		$scope.queryMed = {
	 	   order: 'medicalRecord.date',
	 	   limit: 10,
		    page: 1
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


		
		/////////////////////////////
		// Physical Record Tab      //
		/////////////////////////////
		
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

		/////////////////////////////
		// Medical Record Tab      //
		/////////////////////////////
		$scope.diseaseIdOptions = [ 'ICD10', 'SNOMED', 'DRG' ];
		
		$http.get('/diseases/list').success(function(data) {
			$scope.tempList = data ;
			$scope.loadDiseases = function () {
		      var d = $scope.tempList ;
		      return d.map(function (dis) {
		        dis._lowername = dis.name.toLowerCase();
		        dis._lowerDiseaseId = dis.disease_id.toLowerCase();
		        return dis;
		      });
		    } ;

			$scope.diseaseList = $scope.loadDiseases() ;		
		});
		


		$scope.showMedicalRecordForm = function(ev,mode,medicalRecord){
			var createMedCtrl = function($scope ,doctorName , medical_records_fac,medicalRecord ,diseaseList){
				$scope.medicalRecord = {doctor : doctorName , diseases:[]} ;
				$scope.diseaseList = diseaseList ;
			    $scope.selectedItem = null;
			    $scope.searchText = null;
			    console.log(diseaseList);
		        $scope.cancel = function() {
		            $mdDialog.cancel();
		        };
		        $scope.submitMedicalRecord = function(){
					//medical_records_fac.add(patient, );
					$mdDialog.hide({mode : 'create' , medicalRecord : $scope.medicalRecord});
		      	};
		      	$scope.transformChip = function(chip) {
			      // If it is an object, it's already a known chip
			      if (angular.isObject(chip)) {
			      	console.log("Tchip");
			      	console.log(chip.disease_id);
			        return chip;
			      }
			      // Otherwise, create a new one
			      return ;
			    };
			     $scope.querySearch = function (query) {
			      var results = query ? $scope.diseaseList.filter($scope.createFilterFor(query)) : [];
			      return results;
			    };
			    $scope.createFilterFor = function (query) {
			      var lowercaseQuery = angular.lowercase(query);
			      return function filterFn(disease) {
			      	console.log(disease);
			        return (disease._lowername.indexOf(lowercaseQuery) === 0) ||
			            (disease._lowerDiseaseId.indexOf(lowercaseQuery) === 0);
			      };
			    };

		      };
		    var editMedCtrl = function($scope , doctorName , medical_records_fac ,medicalRecord , diseaseList){
				$scope.medicalRecord = medicalRecord ;
		        $scope.cancel = function() {
		            $mdDialog.cancel();
		        };
		        $scope.submitMedicalRecord = function(){
					$mdDialog.hide({mode : 'edit' , medicalRecord : $scope.medicalRecord});
		      	};
		      };
		    var mCtrl = {};
		    if (mode === 'edit'){
		    	mCtrl = editMedCtrl ;
		    }
		    else{
		    	mCtrl = createMedCtrl ;
		    }
			$mdDialog.show({
	        locals:{medical_records_fac : medical_records_fac , doctorName : $scope.doctorName  , medicalRecord : medicalRecord , diseaseList : $scope.diseaseList},
	        controller: mCtrl,
	        templateUrl: '/dialog/createMedicalRecord.html',
	        parent: angular.element(document.body),
	        targetEvent: ev,
	        clickOutsideToClose:true
	      })
	      .then(function(response) {
	        console.log(response);
	        if(response.mode === "create"){
	        	medical_records_fac.add($scope.patient, response.medicalRecord);
	        }else if (response.mode === "edit"){
				medical_records_fac.update($scope.patient, response.medicalRecord);
	        }
	      });

		};

		$scope.showAddDisease = function()
		{
			$scope.selectedDiseaseIdType = $scope.diseaseIdOptions[0];
			$scope.getDiseaseList($scope.selectedDiseaseIdType);
			$scope.disease = {};
			$scope.showAddDiseaseModal = !$scope.showAddDiseaseModal;
		};

		$scope.diseaseData = [];
		$scope.searchDisease = function(keyword)
		{
			medical_records_fac.searchDisease($scope.disease.disease_id_type, keyword, $scope.diseaseData);
		};


		$scope.getDiseaseList = function(selectedType)
		{
			console.log(selectedType);
			medical_records_fac.getDiseaseList(selectedType, $scope.diseaseData);
		};

		$scope.getDiseaseText = function(diseaseList)
		{
			var diseaseText = '';
			console.log(diseaseList);
			for(var i = 0; i < diseaseList.length; i++)
			{
				var disease = diseaseList[i];

				disease += disease.disease_id_type + '/' + disease.disease_id + '-' + disease.name + '</br>';
			}
			return diseaseText;
		};

		$scope.submitAddDisease = function()
		{
			$scope.showAddDiseaseModal = !$scope.showAddDiseaseModal;
			$scope.medicalRecord.diseases.push($scope.disease);
		};

		$scope.selectDisease = function(selectedDisease)
		{
			$scope.disease = selectedDisease;
		};

		$scope.removeDisease = function(index)
		{
			for(var i = 0; i < $scope.medicalRecord.diseases.length; i++)
			{
				if(i === index) {
					$scope.medicalRecord.diseases.splice(i,1) ;
					break;
				}
			}
		};

		$scope.submitMedicalRecord = function()
		{

			if($scope.mode === 'create'){
				medical_records_fac.add($scope.patient, $scope.medicalRecord);
			}

			else if($scope.mode === 'edit')
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

		/////////////////////////////
		// Prescription Detail Tab //
		/////////////////////////////
		
		$scope.prescription = {};

		$scope.showPresModal = false;

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


		$scope.med_dosage = {};
		

		medicines_fac.getMedicineList() ;
		$scope.medicineList = medicines_fac.medicineList;
		// Get medicine list
		
		$scope.showAddMedicine = function()
		{
			$scope.showAddMedicineModal = true;
			medicines_fac.getMedicineList();
			// Reset from
			$scope.med_dosage = {};

		};

		$scope.submitAddMedicine = function() {
			$scope.showAddMedicineModal = !$scope.showAddMedicineModal;
			
			// Add to prescription
			$scope.prescription.med_dosage_list.push($scope.med_dosage);
		};

		$scope.removeMedicine = function(index) {
			// Remove index th med_dosage
			$scope.prescription.med_dosage_list.splice(index, 1);
		};

		$scope.submitPrescription = function() {
			var mode = $scope.mode;
			if(mode === 'create')
			{
				// Add patient id to prescription
				$scope.prescription.patient = $scope.patient;

				// Call factory to submit it to server
				prescription_records_fac.add($scope.patient, $scope.prescription);

			}
			else if(mode === 'edit')
			{
				// Call factory to send updated prescription to server
				prescription_records_fac.update($scope.patient, $scope.prescription);

			}
			else
			{
				console.error('submitPrescription: mode ' + mode + " not found!");
			}

			
			$scope.showPresModal = !$scope.showPresModal;
		};

		$scope.removePrescription = function(prescription) {
			if(confirm("Are you sure?")){
				prescription_records_fac.delete($scope.patient, prescription);
			}
			
		};

		$scope.allergy = ['Yakult' , 'Amphet' , 'Wappa' ];
		
		$scope.showPrescriptionForm = function(ev){
		   var createPrescriptionCtrl = function($scope , medicineList){
		   		$scope.addedMedicine = {};
		      	$scope.prescription = { med_dosage_list :[]} ;
				$scope.medicineList = medicineList;
		        $scope.cancel = function() {
		            $mdDialog.cancel();
		        };
		        $scope.submitPrescription = function(prescription){
				// update in db
					
					// console.log($scope.prescription) ;
					$mdDialog.hide({ med_dosage_list : $scope.prescription.med_dosage_list});
		      	};
		      	$scope.addMedicine = function(){
		   			
		   			for(var i in $scope.medicineList) {
		   				var med = $scope.medicineList[i];
		   				if(med._id === $scope.addedMedicine.medicine)
		   				{
		   					$scope.addedMedicine.medicine = med;
		   					break;
		   				}
		   			}
		   			var aMed = {
		   				medicine: $scope.addedMedicine.medicine,
		   				dosage: $scope.addedMedicine.dosage,
		   				howTo: $scope.addedMedicine.howTo
		   			};
		   			$scope.prescription.med_dosage_list.push(aMed);
		   			console.log($scope.addedMedicine);		   			
		   			$scope.addedMedicine = {};
		      	};
		      	$scope.removeMedicine = function(index){
		      		if(confirm("Are you sure?") ){
						$scope.prescription.med_dosage_list.splice(index,1) ;
		      		}
		      	};
		     };
			$mdDialog.show({
	        locals:{medicineList : $scope.medicineList},
	        controller: createPrescriptionCtrl,
	        templateUrl: '/dialog/createPrescription.html',
	        parent: angular.element(document.body),
	        targetEvent: ev,
	        clickOutsideToClose:true
	      })
	      .then(function(response) {
	        console.log(response);
	        var medicineList = {patient: $scope.patient._id, doctor: $scope.doctorName , status: 'รอการจ่าย',
	        		date: new Date(), med_dosage_list: response.med_dosage_list};
	        	console.log(medicineList.med_dosage_list);
        	$http.post('/prescriptions/insert/' + $scope.patient._id, medicineList).success(function(){
        	
				$scope.patient.prescription_record.push(medicineList);
	  		});
	      }, function() {
	      });
	  	};
		$scope.showPresDetail = function(ev,p){
		   var detailCtrl = function($scope,prescription,prescriptionList){
		      	$scope.prescriptionList = prescriptionList;
		      	$scope.prescription={};
		      	angular.copy(prescription , $scope.prescription);
		      	$scope.prescription.status = "" ;
		      	$scope.prescription =prescription ;
		      	$scope.isPharmacist = false ;
		        $scope.cancel = function() {
		            $mdDialog.cancel();
		        };		      
		    };
			$mdDialog.show({
	        locals:{prescription : p , prescriptionList : $scope.prescriptionList},
	        controller: detailCtrl,
	        templateUrl: '/dialog/prescriptionDetailDoc.html',
	        parent: angular.element(document.body),
	        targetEvent: ev,
	        clickOutsideToClose:true
	      })
	      .then(function(answer) {
	        //Do something after close dialog
	        //Switch to another page
	      });
		

		};
	}
]);

app.controller('symptomCtrl', function($scope, $mdSidenav) {
                $scope.departmentList = [
                  {id:"10",name:"Comp"},
                  {id:"11",name:"Elec"},
                  {id:"12",name:"Chem"},
                  {id:"13",name:"Civil"},
                  {id:"14",name:"Mech"},
                ];
                $scope.doctorList = [
                  {id:"1",name:"Santa",department:"Comp"},
                  {id:"2",name:"Gale",department:"Elec"},
                  {id:"2",name:"Kirk",department:"Mech"},
                  {id:"3",name:"Tutor",department:"Mech"},
                  {id:"4",name:"Mma",department:"Mech"},
                ];
                $scope.submit = function(){
                    console.log($scope.department + $scope.symptoms);
                };
             });

app.controller('appointmentListCtrl', ['$scope', '$filter', 'appointment_fac', 'CalendarData', function($scope, $filter, appointment_fac, CalendarData) {
	$scope.dayFormat = "d";
	$scope.selectedDate = null;
	$scope.tooltips = true;

	$scope.firstDayOfWeek = 0; // First day of the week, 0 for Sunday, 1 for Monday, etc.
	$scope.appointmentList = appointment_fac.appointmentList;
	$scope.selectedAppointmentData = [];

	var startAM = 9 * 60 + 30;
	var startPM = 13 * 60;

	$scope.getTimeMessage = function(time, slot)
	{
		var minutes = time === 'AM' ? startAM + slot * 10 : startPM + slot * 10;
		var min = minutes % 60;
		var hour = (minutes - min) / 60;
		var dateTime = new Date();
		dateTime.setHours(hour);
		dateTime.setMinutes(min);
		return $filter('date')(dateTime, "H:mm");
	};

	var getAppointmentListByDate = function(date)
	{
		var result = [];
		var sDate = new Date(date);

		$scope.appointmentList.forEach(function(app){
			var appDate = new Date(app.roundWard.date);
			if(appDate.getMonth() === sDate.getMonth() && appDate.getFullYear() === sDate.getFullYear() && appDate.getDate() === sDate.getDate())
			{
				result.push(app);
			}
		});
		angular.copy(result, $scope.selectedAppointmentData);
	};

	$scope.setCalendar = function()
	{
		console.log('Set calendar');
		$scope.loadingCount--;
		if($scope.loadingCount > 0) { return; }
		$scope.appointmentList.forEach(function(app){
			CalendarData.setDayContent(new Date(app.roundWard.date), "<i class='material-icons'>event</i>");
		});
	};

	$scope.init = function()
	{
		var curDate = new Date();
		appointment_fac.getCalendar(curDate.getMonth(), curDate.getFullYear(), $scope.setCalendar);
	};

	$scope.setDirection = function(direction) {
		$scope.direction = direction;
		$scope.dayFormat = direction === "vertical" ? "EEEE, MMMM d" : "d";
	};

    $scope.dayClick = function(date) {
      $scope.msg = "You clicked " + date;
      $scope.selectedDate = date;
      getAppointmentListByDate(date);
    };

    $scope.prevMonth = function(data) {
      $scope.msg = "You clicked (prev) month " + data.month + ", " + data.year;
      $scope.loadingCount++;
      appointment_fac.getCalendar(data.month - 1, data.year, $scope.setCalendar);
    };

    $scope.nextMonth = function(data) {
      $scope.msg = "You clicked (next) month " + data.month + ", " + data.year;
      $scope.loadingCount++;
      appointment_fac.getCalendar(data.month - 1, data.year, $scope.setCalendar);
    };

    
    $scope.setDayContent = function(date) {
        return "<p></p>";
    };

}]);

app.controller('roundWardCtrl', ['$scope', '$filter', '$mdDialog', '$http', 'roundward_fac', 'CalendarData', function($scope, $filter, $mdDialog, $http, roundward_fac, CalendarData) {
	$scope.dayFormat = "d";
	$scope.selectedDate = null;
	$scope.showDate = null;
	$scope.tooltips = true;

	$scope.firstDayOfWeek = 0; // First day of the week, 0 for Sunday, 1 for Monday, etc.
	$scope.roundwardList = roundward_fac.roundwardList;
	$scope.roundwardCache = roundward_fac.roundwardCache;

	$scope.loadingCount = 0;

	$scope.selectedRoundward = [];
	$scope.canceledRoundward = null;

	$scope.setCalendar = function()
	{
		$scope.roundwardList.forEach(function(roundwardObj){
			CalendarData.setDayContent(roundwardObj.date, "<i class='material-icons'>event</i>");
		});
		$scope.loadingCount--;
	};

	$scope.init = function()
	{
		var date = new Date();
		$scope.loadingCount++;
		roundward_fac.getCalendar(date.getMonth(), date.getFullYear(), $scope.setCalendar);
	};

	$scope.setDirection = function(direction) {
		$scope.direction = direction;
		$scope.dayFormat = direction === "vertical" ? "EEEE, MMMM d" : "d";
	};

    $scope.dayClick = function(date) {
      $scope.msg = "You clicked " + date;

      // Prevent selecting date while loading
      console.log($scope.loadingCount);
      if($scope.loadingCount > 0) { return; }

      $scope.showDate = date;

      var rwAM = roundward_fac.getRoundwardCache(date, 'AM');
      var rwPM = roundward_fac.getRoundwardCache(date, 'PM');

      $scope.selectedRoundward = [];
      if(rwAM) { $scope.selectedRoundward.push(rwAM); }
      if(rwPM) { $scope.selectedRoundward.push(rwPM); }

      console.log($scope.selectedRoundward);
      
    };

    $scope.prevMonth = function(data) {
      $scope.msg = "You clicked (prev) month " + data.month + ", " + data.year;
      $scope.loadingCount++;
  		roundward_fac.getCalendar(data.month - 1, data.year, $scope.setCalendar);
    };

    $scope.nextMonth = function(data) {
      $scope.msg = "You clicked (next) month " + data.month + ", " + data.year;
      $scope.loadingCount++;
		roundward_fac.getCalendar(data.month - 1, data.year, $scope.setCalendar);
    };

    
    $scope.setDayContent = function(date) {
    	return "<p></p>";
    };

    $scope.successAddRoundward = function(date)
    {
    	CalendarData.setDayContent(date, "<i class='material-icons'>event</i>");
    	$scope.loadingCount--;
    	$scope.dayClick(date);
    };

    $scope.successCancelRoundward = function(rwInfo)
    {
    	var rwAM = roundward_fac.getRoundwardCache(rwInfo.date, 'AM');
      	var rwPM = roundward_fac.getRoundwardCache(rwInfo.date, 'PM');

      	console.log(rwAM);
      	console.log(rwPM);

      	if(rwAM || rwPM)
      	{
      		CalendarData.setDayContent(rwInfo.date, "<i class='material-icons'>event</i>");
      	}
      	else
      	{
      		CalendarData.setDayContent(rwInfo.date, "<p></p>");
      	}
    	
    	$scope.loadingCount--;
    	$scope.dayClick(rwInfo.date);
    };

    var addDialogCtrl = function ($scope, $mdDialog, rwTimes) {

		$scope.rwTimes = rwTimes;

	    $scope.selectedTime = null;

	  $scope.hide = function() {
	    $mdDialog.hide();
	  };
	  $scope.cancel = function() {
	    $mdDialog.cancel();
	  };
	  $scope.answer = function(selected) {
	    $mdDialog.hide(selected);
	  };
	};

	var cancelDialogCtrl = function ($scope, $mdDialog, rwInfo) {

		$scope.rwInfo = rwInfo;

	  $scope.cancel = function() {
	    $mdDialog.cancel();
	  };
	  $scope.confirm = function() {
	    $mdDialog.hide();
	  };
	};

    $scope.showAddDialog = function(ev) {
    	var rwTimes = [];
    	if($scope.selectedRoundward.length === 0)
    	{
    		// Show both AM and PM options
    		rwTimes = [
	    		{ value: 'AM', th: 'เช้า' },
	    		{ value: 'PM', th: 'บ่าย' }
	    	];
    	}
    	else if($scope.selectedRoundward.length === 1)
    	{
    		// Show only another option that wasn't added
    		rwTimes.push($scope.selectedRoundward[0].time === 'AM' ? { value: 'PM', th: 'บ่าย' } : { value: 'AM', th: 'เช้า' });
    	}
    	else
    	{
    		// Cannot add!
    		return;
    	}

		$mdDialog.show({
		  controller: addDialogCtrl,
		  locals: { 'rwTimes': rwTimes },
		  templateUrl: '/dialog/addRoundward.html',
		  parent: angular.element(document.body),
		  targetEvent: ev,
		  clickOutsideToClose:true
		})
	    .then(function(time) {
	      var rwInfo = {
	      	date: $scope.showDate,
	      	time: time
	      };
	      console.log(rwInfo);

	      $scope.loadingCount++;
	      roundward_fac.addRoundward($scope.showDate, time, $scope.successAddRoundward);

	    }, function() {

	    });
	};

	$scope.showCancelDialog = function(ev, rwInfo) {
		console.log(rwInfo);
		$scope.canceledRoundward = rwInfo;
		$mdDialog.show({
		  controller: cancelDialogCtrl,
		  locals: { 'rwInfo': rwInfo },
		  templateUrl: '/dialog/cancelRoundward.html',
		  parent: angular.element(document.body),
		  targetEvent: ev,
		  clickOutsideToClose:true
		})
	    .then(function() {

	      $scope.loadingCount++;
	      	console.log($scope.canceledRoundward);
	      roundward_fac.cancelRoundward($scope.canceledRoundward._id, $scope.successCancelRoundward);

	    });
	};

}]);

app.controller('makeAppointmentCtrl', ['$scope', '$q', '$timeout', '$log', '$http', function($scope, $q, $timeout, $log, $http) {

	$scope.selectedType = 'Doctor';

    $scope.departmentList = [
      {name:"Comp"},
      {name:"Elec"},
      {name:"Chem"},
      {name:"Civil"},
      {name:"Mech"},
    ];
    $scope.doctorList = [
      {id:"1",name:"Santa",department:"Comp"},
      {id:"2",name:"Gale",department:"Elec"},
      {id:"3",name:"Kirk",department:"Mech"},
      {id:"4",name:"Tutor",department:"Mech"},
      {id:"5",name:"Mma",department:"Mech"},
    ];
    $scope.submit = function(){
        
    };



    $scope.querySearch = function (query) {
      	deferred = $q.defer();
      	$http.get('/doctor/find/' + query).success(function(data){
      		deferred.resolve(data);
      	});
      	return deferred.promise;
    };


 }]);

app.controller('ViewAppointmentCtrl', [
	'$scope', 
	'$filter', 
	'$http', 
	function($scope, $filter, $http) {
		$scope.appInfo = null;
		$scope.appId = null;

		var startAM = 9 * 60 + 30;
		var startPM = 13 * 60;

		$scope.getTimeMessage = function(time, slot)
		{
			var minutes = time === 'AM' ? startAM + slot * 10 : startPM + slot * 10;
			var min = minutes % 60;
			var hour = (minutes - min) / 60;
			var dateTime = new Date();
			dateTime.setHours(hour);
			dateTime.setMinutes(min);
			return $filter('date')(dateTime, "H:mm");
		};

		$scope.getAppointmentData = function()
		{
			$http.get('/appointment/info/' + $scope.appId).success(function(data){
				console.log(data);
				$scope.appInfo = data;
			});
		};

		// Initial page by getting appointment data
		$scope.init = function(appId)
		{	$scope.appId = appId;
			$scope.getAppointmentData();
		};
		/*
		// Confirm appointment
		$scope.confirm = function()
		{

		};
		// Postpone appointment
		$scope.postpone = function()
		{

		};
		// Cancel appointment
		$scope.cancel = function()
		{
			console.log('canceling...');
			$http.delete('/appointment/' + $scope.appId + '/cancel')
			.success(function(result){
				console.log('Successfully cancelled');
				console.log(result);
				$scope.appInfo.status = result.status;
			})
			.error(function(err)
			{
				console.log('Error cancelling ' + err);
			});
		};*/


	}
]);

app.controller('confirmAppointmentCtrl', ['$scope', '$mdDialog', '$http', '$filter', 'CalendarData', function($scope, $mdDialog, $http, $filter, CalendarData) {
		
		$scope.selectedAvailableDate = null;
		$scope.appointmentDate = null;
		$scope.selectedData = [];
		$scope.freeSlots = [];
		$scope.loadingCount = 0;
		$scope.doctorName = '';
		$scope.selectedSlot = {};
		$scope.sending = false;
		$scope.success = false;

		var startAM = 9 * 60 + 30;
		var startPM = 13 * 60;
		var getFreeSlots = function(selectedData)
		{
			var freeSlots = [];
			selectedData.forEach(function(data){
	    		data.freeSlot.forEach(function(slot)
	    		{	
	    			var minutes = data.time === 'AM' ? startAM + slot * 10 : startPM + slot * 10;
	    			var min = minutes % 60;
	    			var hour = (minutes - min) / 60;
	    			var time = new Date();
	    			time.setHours(hour);
	    			time.setMinutes(min);
	    			var slotObj = { time: data.time, slot: slot, displayMsg: $filter('date')(time, "H:mm") };
	    			console.log(slotObj);
	    			freeSlots.push(slotObj);
	    		});
	    	});
	    	return freeSlots;
		};

		$scope.init = function(earliestData, patient_id, patientName, patientLastname)
		{	
			var data = JSON.parse(earliestData);
			$scope.doctor_id = data.doctor_id;
			$scope.patient_id = patient_id;
			$scope.doctorName = data.firstname + ' ' + data.lastname;
			$scope.patientName = patientName;
			$scope.patientLastname = patientLastname;
			$scope.selectedData.push(data);
			$scope.appointmentDate = new Date(data.date);
			angular.copy(getFreeSlots($scope.selectedData), $scope.freeSlots);
			$scope.selectedSlot = $scope.freeSlots[0];
		};

		$scope.submit = function()
		{
			if($scope.sending)
			{
				return;
			}
			$scope.sending = true;
			var app = {
				patient_id: $scope.patient_id,
				date: $scope.appointmentDate,
				status: 'confirmed',
				slot: $scope.selectedSlot.slot,
				time: $scope.selectedSlot.time,
				causes: $scope.causes
			};
			console.log('sending...');
			console.log(app);
			$http.post('/appointment/create', app).success(function(data){
				console.log('Successs');
				console.log(data);
				$scope.sending = false;
				$scope.success = true;
			}).error(function(err){
				console.log('Error');
				console.log(err);
				$scope.sending = false;
			});
		};

        
        var DialogController = function($scope, $mdDialog, $http, CalendarData, doctor_id)
        {
        	$scope.dayFormat = "d";
			$scope.selectedDate = null;
        	$scope.firstDayOfWeek = 0; // First day of the week, 0 for Sunday, 1 for Monday, etc.
        	$scope.loadingCount = 0;
        	$scope.availableData = [];

        	$scope.init = function()
        	{
        		console.log('getting current month data');
        		var cur_date = new Date();
        		$scope.getData(cur_date.getMonth() + 1, cur_date.getFullYear(), $scope.setCalendar);
        	};

			$scope.getData = function(month, year, callback)
			{
				$scope.loadingCount++;
				$http.post('/getAvailableDateTime', { doctor_id: doctor_id, month: month-1, year: year }).success(function(result){
	        		// result: date, firstname, lastname, time, doctor_id, roundward, freeslot
	        		console.log(result);
	        		angular.copy(result, $scope.availableData);
	        		$scope.loadingCount--;
	        		callback();
	        	});
			};

			$scope.checkAvailable = function(date)
			{
				for(var i in $scope.availableData)
				{
					var data = $scope.availableData[i];
					var dataDate = new Date(data.date);
					if(dataDate.getDate() === date.getDate() && dataDate.getMonth() === date.getMonth() && dataDate.getFullYear() && date.getFullYear())
					{
						return true;
					}
				}
				return false;
			};

			$scope.setCalendar = function()
			{
				console.log('Set calendar');
				if($scope.loadingCount > 0) { return; }
				$scope.availableData.forEach(function(data){
					console.log(data);
					CalendarData.setDayContent(new Date(data.date), "<i class='material-icons'>event</i>");
				});
			};

        	$scope.close = function()
        	{
        		$mdDialog.cancel();
        	};

        	$scope.setDirection = function(direction) {
				$scope.direction = direction;
				$scope.dayFormat = direction === "vertical" ? "EEEE, MMMM d" : "d";
			};

	        $scope.dayClick = function(date) {
	            if ($scope.checkAvailable(date)){
	              	$scope.selectedDate = date;
	          	}
	            else{
	              	$scope.selectedDate = null;
	            }
	        };

	        $scope.prevMonth = function(data) {
	          $scope.msg = "You clicked (prev) month " + data.month + ", " + data.year;
	          $scope.getData(data.month, data.year, $scope.setCalendar);
	        };

	        $scope.nextMonth = function(data) {
	          $scope.msg = "You clicked (next) month " + data.month + ", " + data.year;
	          $scope.getData(data.month, data.year, $scope.setCalendar);
	        };

	        $scope.tooltips = true;
	        $scope.setDayContent = function(date) {
	        	return "<p></p>";
	        };

	        $scope.changeDate = function()
	        {
	        	var date = $scope.selectedDate;
	        	var result = [];
	        	// Find freeslot data
	        	for(var i in $scope.availableData)
				{
					var data = $scope.availableData[i];
					var dataDate = new Date(data.date);
					if(dataDate.getDate() === date.getDate() && dataDate.getMonth() === date.getMonth() && dataDate.getFullYear() && date.getFullYear())
					{
						result.push(data);
					}
				}
	        	$mdDialog.hide(result);
	        };


        };

       
        $scope.showDialog = function(ev) {
		    $mdDialog.show({
		    	locals: { doctor_id: $scope.doctor_id },
		    	controller: DialogController,
		      templateUrl: '/dialog/selectDateDialog.html',
		      parent: angular.element(document.body),
		      targetEvent: ev,
		      clickOutsideToClose:true
		    }).then(function(selectedData)
		    {
		    	angular.copy(getFreeSlots(selectedData), $scope.freeSlots);
		    	$scope.selectedData = selectedData;
		    	$scope.appointmentDate = new Date(selectedData[0].date);
		    	$scope.selectedSlot = $scope.freeSlots[0];
		    });
	  	};

	  	var SelectTimeDialogController = function($scope, $mdDialog, availableSlots)
	  	{
	  		$scope.availableSlots = availableSlots;
	  		$scope.selectedSlot = 0;
	  		$scope.select = function(selectedSlot)
	  		{
	  			console.log(selectedSlot);
	  			$mdDialog.hide(availableSlots[selectedSlot]);
	  		};
	  		$scope.close = function()
	  		{
	  			$mdDialog.cancel();
	  		};
	  	};

	  	$scope.showSelectTimeDialog = function(ev)
	  	{
	  		$mdDialog.show({
	  			locals: { availableSlots: $scope.freeSlots },
		    	controller: SelectTimeDialogController,
		      templateUrl: '/dialog/selectAppTimeDialog.html',
		      parent: angular.element(document.body),
		      targetEvent: ev,
		      clickOutsideToClose:true
		    }).then(function(selectedSlot)
		    {
		    	$scope.selectedSlot.slot = selectedSlot.slot;
		    	$scope.selectedSlot.displayMsg = selectedSlot.displayMsg;
		    	console.log(selectedSlot.displayMsg);
		    });
	  	};


}]);



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
          if(value === true)
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

app.controller('InfoUserCtrl', [
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
			patients_fac.getPatientUser($scope.patient_id).success(function(data){
				var obj_id = data._id ; 
				$scope.patient = data.userId;
				$scope.patient.blood_type = data.blood_type;
				$scope.patient.patient_id = data.patient_id;
				$scope.patient.physical_record = data.physical_record ;
				$scope.patient.medical_record = data.medical_record ;
				$scope.patient.prescription_record = data.prescription_record ;
				
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


		$scope.showEditProfile = function(ev){
			var editCtrl = function($scope,patient){
		      	$scope.cancel = function() {
			         $mdDialog.cancel();
			    };
		      	$scope.patient = patient;
		      	// $scope.patient.gender = "M";
		      	// $scope.patient.blood_type = "A";
		      	$scope.bloodList = ["A","B","AB","O"];
	    		$scope.genderList = [{abb:"M",gen:"ชาย"},{abb:"F",gen:"หญิง"}];
		      	$scope.submitProfile = function(){
		        	if ($scope.patient.firstname !== null &&
		        		$scope.patient.lastname !== null &&
		        		$scope.patient.gender !== null &&
		        		$scope.patient.email !== null &&
		        		$scope.patient.address !== null &&
		        		$scope.patient.ssn !== null &&
		        		$scope.patient.blood_type !== null &&
		        		$scope.patient.birthdate !== null &&
		        		$scope.patient.telNum !== null
		        		){
		        			console.log($scope.patient);
							$mdDialog.hide($scope.patient);}
		      	};
	            /*$http.post('/register', $scope.regData).success(function(data) {
	              if(data.status === 'success')
	              {
	                $scope.regMessage = 'Successfully registered!';
	                $window.location.href = "/home" ;
	              }
	              else
	              {
	                $scope.regMessage = 'Try again!';
	              }
	            });*/
		      $scope.updateProfile = function(){	
	        	console.log(patient);
		      };
		      };	
		$mdDialog.show({
	        locals:{patient: $scope.patient},
	        controller: editCtrl,
	        templateUrl: '/dialog/editProfile.html',
	        parent: angular.element(document.body),
	        targetEvent: ev,
	        clickOutsideToClose:true
	      })
	      .then(function(patient) {
	        //Do something after close dialog
	        $scope.patient.age = (function(){
				    return (new Date().getFullYear() - patient.birthdate.getFullYear());
			}());
	        patients_fac.update(patient);
	         //console.log(patient);
	        //Switch to another page
	      }, function() {

	      });

	    } 	;

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
