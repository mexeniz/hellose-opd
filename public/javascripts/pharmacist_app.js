(function(){
var app = angular.module('pharmacist', ['ui.router', 'ngMaterial','md.data.table']) ;
// Angular Material Config
app.config(function($mdThemingProvider){

  $mdThemingProvider.theme('default')
      .primaryPalette('green')
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


app.factory('prescriptions_fac', ['$http', function($http){
	  var o = {
	  	prescriptions : []
	  };
	  
	  o.getList = function(){
	  	return $http.get('prescriptions/list').success(function(data){
	      for(var i = 0  ; i < data.length  ; i++){
					o.prescriptions.push(data[i]);
					// console.log(o.prescriptions[o.prescriptions.length-1]);
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

app.controller('ListCtrl', [
	'$scope',
	'$q',
	'prescriptions_fac',
	'$mdDialog',

	function($scope,$q, prescriptions_fac,$mdDialog){
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
			var fullname = (data.patient.firstname + " " + data.patient.lastname).toLowerCase();
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
	}
]);


app.controller('InfoCtrl', [
	'$scope',
	'patients_fac',
	'prescription_records_fac',
	'medicines_fac',
	'$q',
	'$mdDialog',
	'$http',
	function($scope, patients_fac, prescription_records_fac, medicines_fac,$q,$mdDialog,$http){
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

})();

