(function(){
var app = angular.module('prescriptions', ['ui.router']) ;

app.factory('prescriptions_fac', ['$http', function($http){
	  var o = {
	  	prescriptions : [
	  	{"date":'20/10/58',"patient_name":'นายก',"patient_lastname":'ตู่',"status":"รอการจ่าย"},
	  	{"date":'21/11/58',"patient_name":'เอ็มม่า',"patient_lastname":'ราชาลิง',"status":"จ่ายแล้ว"}]
	  };
	  
	  o.getList = function(){
	  	return o.prescriptions;
	  };

	  return o;
	}]);

app.controller('ListCtrl', [
	'$scope',
	'prescriptions_fac',
	function($scope, prescriptions_fac){
		prescriptions_fac.getList();
		$scope.prescriptions = prescriptions_fac.prescriptions;
	}
]);

})();
