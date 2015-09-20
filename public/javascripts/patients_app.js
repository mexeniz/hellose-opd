(function(){
var app = angular.module('patients', ['ui.router']) ;

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

	  $stateProvider
	    .state('list', {
	      url: '/list',
	      controller: 'ListCtrl',
	      resolve: {
		    patientsPromise: ['patients', function(patients){
		      return patients.getList();
		    }]
		  }
	    });
	    
	  $urlRouterProvider.otherwise('list');
}]);

app.factory('patients', ['$http', function($http){
	  var o = {
	  	patients : []
	  };
	  // Use Route! Connect to backend and retrieve data
	  o.getList = function() {
	    return $http.get('/patients/store').success(function(data){
	      angular.copy(data, o.patients);
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
	'patients' ,
	'$stateParams' ,
	function($scope , patients ,$stateParams ){
		$scope.patients = patients.patients ;
	}
]);

})();