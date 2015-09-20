(function(){
var app = angular.module('patients', ['ui.router']) ;

// app.factory('patient', ['$http', function($http){
// 	return {
// 		getList: function() {
// 			return $http.get('/patients/store');
// 		}
// 	}	  
// }]);
app.factory('patients_fac', ['$http', function($http){
	  var o = {
	  	patients : []
	  };
	  // Use Route! Connect to backend and retrieve data
	  o.getList = function() {
	    return $http.json('/patients/store').success(function(data){
	      for(var i = 0  ; i < data.length  ; i++){
			o.patients.push(data[i]);
			console.log(o.patients[o.patients.length-1]);
			}
	    });
	  };
	  o.create = function(patient) {
		  return $http.post('/patients', patient).success(function(data){
		    o.patients.push(data);
		});
	  };
	  return o;
	}]);
app.controller('ListCtrl', [
	'$scope', 
	'patients_fac' ,
	function($scope , patients_fac ){
		$scope.patients = patients_fac.getList();
		console.log(patients_fac);
		for (var i = 0 ; i < $scope.patients.length  ; i++){
			console.log(i+1 +" " +$scope.patients[i]) ;
		}
	}
]);

})();