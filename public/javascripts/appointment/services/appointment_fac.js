"use strict";
/**
Appointment CRUD Services RESTful API
*/

app.factory('appointment_fac', ['$http', function($http){
	//Scope's (appointment_fac) "Object"
	  var appointment_obj = {
	  	appointment : []
	  };

	//Object's Services
	//Get All Appointment in the System
	appointment_obj.getAllList = function() {
	  	//Use Express Route to fetch Data
	    return $http.get('/appointment/getAll').success(function(data){
	    	//After got the Data from Express JSON
	    	for(var i = 0  ; i < data.length  ; i++){
				appointment_obj.appointment.push(data[i]);
			}
	    });
	  };
	//Get Appointments on specific date
	appointment_obj.getAtDate = function(date) {
		//"date" (2nd param) will be packed in REQ.BODY  (ctrl-appointment)
		//then Find The Correspondent Entry and packed back in "data"
		return $http.post('/appointment/getAtDate/',date)
		.success(function(data) {
			//Clear Array
			appointment_obj.appointment.length = 0;
			//Fill Array with the POPULATED data
			for(var i = 0 ; i < data.length ; i++){
				appointment_obj.appointment.push(data[i]);
			}
		});
	};
	//Create Appointment
	appointment_obj.create = function(appointment) {
		//retrieve "appointment"  obj (packed from controller)
		//then packed (2nd param) on REQ.BODY  (ctrl-appointment)
		return $http.post('/appointment/insert', appointment)
				.success(function(data){
					//After Success Adding the Appointment AT BACKEND
					//Fill the User's Cache in the FRONTEND
					appointment_obj.appointment.push(data);
					});
	  };
	//Get Specific Appointment
	appointment_obj.getAppointmentById = function(appointment_id) {
			return $http.get('/appointment/info/' +appointment_id);
		};

	  return appointment_obj;
	}]);