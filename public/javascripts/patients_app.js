(function(){
var app = angular.module('patients', ['ui.router', 'ngMaterial', 'materialCalendar']) ;

// Angular Material Config
app.config(function($mdThemingProvider, $mdIconProvider){

                      $mdThemingProvider.theme('default')
                          .primaryPalette('teal')
                          .accentPalette('cyan')
                          .warnPalette('pink');

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
			// console.log(medRecord);
			angular.copy(medRecord, newMedRecord);
			// console.log(medRecord.diseases.length);
			if(medRecord.diseases.length > 0){newMedRecord.diseases = [];}
			for(var i = 0; i < medRecord.diseases.length; i++)
			{
				// console.log(medRecord.diseases[i]);
				newMedRecord.diseases.push(medRecord.diseases[i]);
			}
			console.log(newMedRecord);
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

app.factory('appointment_fac', ['$http', '$timeout', function($http, $timeout){
	var o = {
		appointmentList: [],
		appointmentCache: {}
	};

	var getKey = function(doctorId, month, year)
	{
		return doctorId + ' ' + month + ' ' + year;
	};

	o.getCalendar = function(doctorId, month, year, callback)
	{
		console.log('Getting calendar ' + year + ' ' + month);
		/*var rwList = [
			{_id: 0, date: new Date(year, month, 1, 0, 0, 0, 0), time: 'AM'},
			{_id: 1, date: new Date(year, month, 2, 0, 0, 0, 0), time: 'AM'},
			{_id: 2, date: new Date(year, month, 3, 0, 0, 0, 0), time: 'PM'},
			{_id: 3, date: new Date(year, month, 4, 0, 0, 0, 0), time: 'AM'},
			{_id: 4, date: new Date(year, month, 4, 0, 0, 0, 0), time: 'PM'}
		];*/
		

		$http.post('/getAvailableDateTime', { doctor_id: doctorId, month: month, year: year }).success(function(result){
			
			console.log(result);

			/*
			for(var i in rwList)
			{
				var roundward = rwList[i];
				roundward.date = new Date(roundward.date);
				var key = getKey(roundward.date, roundward.time);
				o.roundwardCache[key] = roundward;
			}

			angular.copy(rwList, o.roundwardList);
			


			console.log(o.roundwardList);*/
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
		$http.post('/appointment/addRoundward', { date: date, time: time }).success(function(data)
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

		$http.post('/appointment/cancelRoundward', { rwId: rwId }).success(function(data)
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
	'$mdDialog',
	'$http',
	function($scope, patients_fac, physical_records_fac, medical_records_fac, prescription_records_fac, medicines_fac,$mdDialog,$http){
      	$scope.bloodList = ["A","B","AB","O"];
		$scope.genderList = [{abb:"M",gen:"ชาย"},{abb:"F",gen:"หญิง"}];
		$scope.init = function(patient_id) {
			// Get patient info
			$scope.patient_id = patient_id;
			
			patients_fac.getPatient($scope.patient_id).success(function(data){
				$scope.patient = data;
				$scope.physicalRecordList = data.physical_record ;
				$scope.medicalRecordList = data.medical_record ;
				$scope.prescriptionList = data.prescription_record ;
				
				$scope.patient.birthdate = new Date(data.birthdate);
				console.log(data);

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
		      }
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
	        patients_fac.update(patient, $scope.physicalRecord);
	        // console.log(patient);
	        //Switch to another page
	      }, function() {

	      });

	    } 	;
		

		// PRESCRIPTION RECORD
		$scope.prescription = {}; // Hold prescription form value (temp)

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
		
		$scope.showAddMedicineModal = false;

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

		/////////////////////////////
		// Physical Record Tab      //
		/////////////////////////////
		/*$scope.physicalRecordList = [
			{date:"11/02/16" , weight: 72 , height: 168, blood_pressure:"80/120" , pulse : 120 , temperature : 38.5},
			{date:"11/02/16" , weight: 72 , height: 168, blood_pressure:"80/120" , pulse : 120 , temperature : 38.5},
			{date:"11/02/16" , weight: 72 , height: 168, blood_pressure:"70/120" , pulse : 120 , temperature : 38.5},
			{date:"11/02/16" , weight: 72 , height: 168, blood_pressure:"80/130" , pulse : 120 , temperature : 38.5}
		];*/

		$scope.showPhysicalRecordForm = function(ev,mode,physicalRecord){

			var createPhysCtrl = function($scope , physical_records_fac ,patient ,physicalRecord){
				$scope.physicalRecord = {} ;
		        $scope.cancel = function() {
		            $mdDialog.cancel();
		        };
		        $scope.submitPhysicalRecord = function(){
		        	if ($scope.physicalRecord.weight != null &&
		        		$scope.physicalRecord.height != null &&
		        		$scope.physicalRecord.temperature != null &&
		        		$scope.physicalRecord.blood_pressure != null &&
		        		$scope.physicalRecord.pulse != null ){
					physical_records_fac.add(patient, $scope.physicalRecord);
					$mdDialog.cancel();
				}
		      	};
		      };
		    var editPhysCtrl = function($scope , physical_records_fac ,patient , physicalRecord){
				$scope.physicalRecord = physicalRecord ;
		        $scope.cancel = function() {
		            $mdDialog.cancel();
		        };
		        $scope.submitPhysicalRecord = function(){
		        	if ($scope.physicalRecord.weight !== null &&
		        		$scope.physicalRecord.height !== null &&
		        		$scope.physicalRecord.temperature !== null &&
		        		$scope.physicalRecord.blood_pressure !== null &&
		        		$scope.physicalRecord.pulse !== null ){
					physical_records_fac.update(patient, $scope.physicalRecord);
					$mdDialog.cancel();}
		      	};
		      };
		    var pCtrl = {};
		    if (mode === 'edit'){
		    	pCtrl = editPhysCtrl ;
		    }
		    else{
		    	pCtrl = createPhysCtrl ;
		    }
			$mdDialog.show({
	        locals:{physical_records_fac : physical_records_fac  , patient : $scope.patient , physicalRecord : physicalRecord},
	        controller: pCtrl,
	        templateUrl: '/dialog/createPhysicalRecord.html',
	        parent: angular.element(document.body),
	        targetEvent: ev,
	        clickOutsideToClose:true
	      })
	      .then(function(answer) {
	        //Do something after close dialog
	        //Switch to another page
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

		/////////////////////////////
		// Medical Record Tab      //
		/////////////////////////////
		/*$scope.medicalRecordList = [
			{date:"11/02/16" , doctor:"Mma Rcl" , diseases:"Fever" , symptoms:"High Temp"},
			{date:"11/02/16" , doctor:"Mma Rcl" , diseases:"Fever" , symptoms:"High Temp"},
			{date:"11/02/16" , doctor:"Mma Rcl" , diseases:"Fever" , symptoms:"High Temp"},
			{date:"11/02/16" , doctor:"Mma Rcl" , diseases:"Fever" , symptoms:"High Temp"},
			{date:"11/02/16" , doctor:"Mma Rcl" , diseases:"Fever" , symptoms:"High Temp"}
		];*/
		$scope.diseaseIdOptions = [ 'ICD10', 'SNOMED', 'DRG' ];

		$scope.showMedicalRecordForm = function(ev,mode,medicalRecord){
			var createMedCtrl = function($scope , medical_records_fac ,patient ,medicalRecord){
				$scope.medicalRecord = {diseases:[]} ;
		        $scope.cancel = function() {
		            $mdDialog.cancel();
		        };
		        $scope.submitMedicalRecord = function(){
					medical_records_fac.add(patient, $scope.medicalRecord);
					$mdDialog.cancel();
		      	};
		      };
		    var editMedCtrl = function($scope , medical_records_fac ,patient ,medicalRecord){
				$scope.medicalRecord = medicalRecord ;
		        $scope.cancel = function() {
		            $mdDialog.cancel();
		        };
		        $scope.submitMedicalRecord = function(){
					medical_records_fac.update(patient, $scope.medicalRecord);
					$mdDialog.cancel();
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
	        locals:{medical_records_fac : medical_records_fac , patient : $scope.patient , medicalRecord : medicalRecord},
	        controller: mCtrl,
	        templateUrl: '/dialog/createMedicalRecord.html',
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
		$scope.allergy = ['Yakult' , 'Amphet' , 'Wappa' ];
		$scope.medicineList = {};
		/*$scope.prescriptionList = [
			{_id:"01",date:"1/1/15" , status:"รอการจ่าย" , doctor:"Mma" , medicine: [{name:"Para",dosage:"10",howTo:"Eat"}]},
			{_id:"02",date:"1/1/15" , status:"รอการจ่าย" , doctor:"Mma" , medicine: [{name:"Para",dosage:"10",howTo:"Eat"}]},
			{_id:"03",date:"1/1/15" , status:"รอการจ่าย" , doctor:"Mma" , medicine: [{name:"Para",dosage:"10",howTo:"Eat"}]},
			{_id:"04",date:"1/1/15" , status:"รอการจ่าย" , doctor:"Mma" , medicine: [{name:"Para",dosage:"10",howTo:"Eat"},{name:"Para",dosage:"10",howTo:"Eat"}]}
		];*/
		$scope.showPrescription = function(ev){
		   var createPrescriptionCtrl = function($scope){
		   		$scope.addedMedicine = {};
		      	$scope.prescription = { med_dosage_list :[]} ;
				$scope.medicine = ['A', 'B', 'AB', 'O'];
		         $scope.cancel = function() {
		            $mdDialog.cancel();
		        };
		        $scope.submitPrescription = function(prescription){
				// update in db
					
					// console.log($scope.prescription) ;
					$mdDialog.hide($scope.prescription.med_dosage_list);
		      	};
		      	$scope.addMedicine = function(){
		   			$scope.prescription.med_dosage_list.push($scope.addedMedicine);
		   			$scope.addedMedicine = {};
		      	};
		      	$scope.removeMedicine = function(index){
		      		if(confirm("Are you sure?") ){
						$scope.prescription.med_dosage_list.splice(index,1) ;
		      		}
		      	};
		     };
			$mdDialog.show({
	        controller: createPrescriptionCtrl,
	        templateUrl: '/dialog/createPrescription.html',
	        parent: angular.element(document.body),
	        targetEvent: ev,
	        clickOutsideToClose:true
	      })
	      .then(function(answer) {
	        //Do something after close dialog
	        //Switch to another page
	        // console.log(answer);
	        var medicineList = {patient: $scope.patient._id, doctor: $scope.patient._id, status: 'รอการจ่าย',
	        		date: new Date(), med_dosage_list: answer};
        	$http.post('/prescriptions/insert/' + $scope.patient._id, medicineList).success(function(){
        	
				$scope.prescriptionList.push(medicineList);
	  		});
	      }, function() {
	      });
	  	};
		$scope.showPresDetail = function(ev,prescription){
		   var detailCtrl = function($scope,prescription,prescriptionList){
		      	$scope.prescriptionList = prescriptionList;
		      	console.log($scope.prescriptionList);
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
						$mdDialog.cancel();
			  		});
		      	};
		      };
			$mdDialog.show({
	        locals:{prescription : prescription , prescriptionList : $scope.prescriptionList},
	        controller: detailCtrl,
	        templateUrl: '/dialog/prescriptionDetail.html',
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

app.controller('confirmAppointmentCtrl', ['$scope', '$mdDialog', 'appointment_fac', function($scope, $mdDialog, appointment_fac) {
		
		$scope.selectedAvailableDate = null;
		$scope.appointmentDate = null;
		
		
		$scope.init = function(doctorId)
		{	
			var currentDate = new Date();
			appointment_fac.getCalendar(doctorId, currentDate.getMonth(), currentDate.getFullYear(), () => {});
		};

        
        var DialogController = function($scope, $mdDialog)
        {
        	$scope.dayFormat = "d";
			$scope.selectedDate = null;
        	$scope.firstDayOfWeek = 0; // First day of the week, 0 for Sunday, 1 for Monday, etc.

        	$scope.close = function()
        	{
        		$mdDialog.cancel();
        	};

        	$scope.setDirection = function(direction) {
				$scope.direction = direction;
				$scope.dayFormat = direction === "vertical" ? "EEEE, MMMM d" : "d";
			};

	        $scope.dayClick = function(date) {
	        	$scope.msg = "You clicked " + date;
				console.log($scope.msg);
				var dateList = ["Tue Dec 08 2015 00:00:00 GMT+0700 (SE Asia Standard Time)",
				        "Wed Dec 09 2015 00:00:00 GMT+0700 (SE Asia Standard Time)",
				       "Wed Dec 02 2015 00:00:00 GMT+0700 (SE Asia Standard Time)"];
		        // To select a single date, make sure the ngModel is not an array.
	            if (dateList.indexOf(date+"") > -1){
	              	$scope.selectedAvailableDate = date;
	              	console.log('selected date ' + date.getMonth());
	          	}
	            else{
	              	$scope.selectedAvailableDate = null;
	            }
	        };

	        $scope.prevMonth = function(data) {
	          $scope.msg = "You clicked (prev) month " + data.month + ", " + data.year;
	        };

	        $scope.nextMonth = function(data) {
	          $scope.msg = "You clicked (next) month " + data.month + ", " + data.year;
	        };

	        $scope.tooltips = true;
	        $scope.setDayContent = function(date) {
		        var dateList = ["Tue Dec 08 2015 00:00:00 GMT+0700 (SE Asia Standard Time)",
		                "Wed Dec 09 2015 00:00:00 GMT+0700 (SE Asia Standard Time)",
		               "Wed Dec 02 2015 00:00:00 GMT+0700 (SE Asia Standard Time)"];
		        // To select a single date, make sure the ngModel is not an array.
	            if (dateList.indexOf(date+"") > -1){
	              return "<i class='material-icons'>assignment_turned_in</i>";
	              }
	            else{
	              return "<p></p>";
	            }
	        };

	        $scope.changeDate = function()
	        {
	        	$mdDialog.hide($scope.selectedAvailableDate);
	        };


        };

        $scope.showDialog = function(ev) {
		    $mdDialog.show({
		    	controller: DialogController,
		      templateUrl: '/dialog/selectDateDialog.html',
		      parent: angular.element(document.body),
		      targetEvent: ev,
		      clickOutsideToClose:true
		    }).then(function(selectedAppDate)
		    {
		    	$scope.appointmentDate = selectedAppDate;
		    });
	  	};

	  	var SelectTimeDialogController = function($scope, $mdDialog, availableSlots)
	  	{
	  		$scope.availableSlots = availableSlots;
	  		$scope.selectedSlot = availableSlots[0];
	  		$scope.select = function()
	  		{
	  			$mdDialog.hide($scope.selectedSlot);
	  		};
	  		$scope.close = function()
	  		{
	  			$mdDialog.cancel();
	  		};
	  	};

	  	$scope.availableSlots = [0,1,3,5,7,8,12];

	  	$scope.showSelectTimeDialog = function(ev)
	  	{
	  		$mdDialog.show({
	  			locals: { availableSlots: $scope.availableSlots },
		    	controller: SelectTimeDialogController,
		      templateUrl: '/dialog/selectAppTimeDialog.html',
		      parent: angular.element(document.body),
		      targetEvent: ev,
		      clickOutsideToClose:true
		    }).then(function(selectedSlot)
		    {
		    	$scope.selectedSlot = selectedSlot;
		    });
	  	};


}]);

})();
