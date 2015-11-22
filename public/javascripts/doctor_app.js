(function(){
var app = angular.module('doctor', ['ui.router', 'ngMaterial', 'materialCalendar']) ;

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

app.factory('appointment_fac', ['$http', function($http){
	var o = {
		appointmentList: [],
		busyDate: []
	};

	o.getCalendar = function(month)
	{
		var bd = [];
		angular.copy(bd, o.busyDate);
		o.busyDate.push(Math.floor(Math.random() * 28) + 1);
		o.busyDate.push(Math.floor(Math.random() * 28) + 1);
		o.busyDate.push(Math.floor(Math.random() * 28) + 1);
		o.busyDate.push(Math.floor(Math.random() * 28) + 1);
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
		var rwList = [
			{_id: 0, date: new Date(year, month, 1, 0, 0, 0, 0), time: 'AM'},
			{_id: 1, date: new Date(year, month, 2, 0, 0, 0, 0), time: 'AM'},
			{_id: 2, date: new Date(year, month, 3, 0, 0, 0, 0), time: 'PM'},
			{_id: 3, date: new Date(year, month, 4, 0, 0, 0, 0), time: 'AM'},
			{_id: 4, date: new Date(year, month, 4, 0, 0, 0, 0), time: 'PM'}
		];
		$timeout(function() {
			angular.copy(rwList, o.roundwardList);
			
			for(var i in rwList)
			{
				var roundward = rwList[i];
				var key = getKey(roundward.date, roundward.time);
				o.roundwardCache[key] = roundward;
			}

			console.log(o.roundwardList);
			callback();
		},2000);
		
	};

	o.getRoundwardCache = function(date, time)
	{
		var key = getKey(date, time);
		return o.roundwardCache[key];
	};

	o.addRoundward = function(date, time, callback)
	{
		var rwInfo = {
			date: date,
			time: time
		};
		/*$http.post('/roundward/add', rwInfo).success(function(data)
		{
			o.roundwardList.push(data);
			o.roundwardCache[getKey(data.date, data.time)] = data;
			callback();
		});*/

		$timeout(function() {
			console.log('added roundward');
			console.log(rwInfo);
			o.roundwardList.push(rwInfo);
			o.roundwardCache[getKey(rwInfo.date, rwInfo.time)] = rwInfo;
			callback(date);
		},2000);
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
	function($scope, patients_fac, physical_records_fac, medical_records_fac, prescription_records_fac, medicines_fac){
		$scope.init = function(patient_id) {
			// Get patient info
			$scope.patient_id = patient_id;
			
			patients_fac.getPatient($scope.patient_id).success(function(data){
				$scope.patient = data;

				// Get prescription record
		    	//prescription_records_fac.getAllPrescriptions($scope.patient._id);

		    });

		    
		};

		// PHYSICAL RECORD
		$scope.showPhysModal = false;
		$scope.showPhysicalRecordForm = function(mode,pRecord){

			$scope.mode = mode;

			if(mode === 'edit'){
				$scope.physicalRecord = {};
				angular.copy(pRecord, $scope.physicalRecord);
			}

			else if(mode === 'create'){
				$scope.physicalRecord = {};
			}

			$scope.showPhysModal = !$scope.showPhysModal ;

		};
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

			if(mode === 'edit'){
				$scope.medicalRecord = {};
				angular.copy(medRecord, $scope.medicalRecord);
			}else if(mode === 'create'){
				$scope.medicalRecord = {};
				$scope.medicalRecord.diseases = [];
			}
			$scope.showMedModal = !$scope.showMedModal;
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
app.controller('appointmentListCtrl', ['$scope', '$filter', 'appointment_fac', function($scope, $filter, appointment_fac) {
	$scope.dayFormat = "d";
	$scope.selectedDate = null;
	$scope.tooltips = true;

	$scope.firstDayOfWeek = 0; // First day of the week, 0 for Sunday, 1 for Monday, etc.
	$scope.appointmentList = appointment_fac.appointmentList;
	$scope.busyDate = appointment_fac.busyDate;

	$scope.init = function()
	{
		appointment_fac.getCalendar(11);
	};

	$scope.setDirection = function(direction) {
		$scope.direction = direction;
		$scope.dayFormat = direction === "vertical" ? "EEEE, MMMM d" : "d";
	};

    $scope.dayClick = function(date) {
      $scope.msg = "You clicked " + date;
      $scope.selectedDate = date;
      appointment_fac.getAppointmentListByDate(date);
    };

    $scope.prevMonth = function(data) {
      $scope.msg = "You clicked (prev) month " + data.month + ", " + data.year;
      appointment_fac.getCalendar(data.month);
    };

    $scope.nextMonth = function(data) {
      $scope.msg = "You clicked (next) month " + data.month + ", " + data.year;
      appointment_fac.getCalendar(data.month);
    };

    
    $scope.setDayContent = function(date) {
    	var d = $filter("date")(date, "d");
        if ($scope.busyDate.indexOf(parseInt(d)) > -1){

          return "<i class='material-icons'>assignment_turned_in</i>";
          }
        else{
          return "<p></p>";
        }
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

    var addDialogCtrl = function ($scope, $mdDialog, rwTimes) {

		$scope.rwTimes = rwTimes;

	    $scope.selectedTime = $scope.rwTimes[0];

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

})();
