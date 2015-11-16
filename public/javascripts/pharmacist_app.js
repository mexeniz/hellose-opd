(function(){
var app = angular.module('prescriptions', ['ui.router']) ;

app.factory('prescriptions_fac', ['$http', function($http){
	  var o = {
	  	prescriptions : [{"date":'20/10/58',"patient_name":'นายก',"patient_lastname":'ตู่',"status":"รอการจ่าย"}]
	  };
	  
	  var getList = function(){
	  	return o.prescriptions;
	  };

	  return o;
	}]);
})();