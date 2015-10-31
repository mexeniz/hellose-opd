(function(){
var app = angular.module('main', ['ui.router']) ;

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

	  $stateProvider
	    .state('home', {
	      url: '/home',
	      templateUrl: '/home.html',
	      controller: 'MainCtrl'
	    });
	  $stateProvider
	  	.state('login', {
		  url: '/login',
		  templateUrl: '/login.html',
		  controller: 'LoginCtrl'
		});

	  $urlRouterProvider.otherwise('login');
}]);
app.factory('patient', ['$http', function($http){
	  var o = {
	    patient: []
	  };
	  // Use Route! Connect to backend and retrieve data
	  o.getAll = function() {
	    return $http.get('/patient/list').success(function(data){
	      angular.copy(data, o.patient);
	    });
	  };
	  o.create = function(patient) {
		  return $http.post('/patient', patient).success(function(data){
		    o.patient.push(data);
		});
	  };
	  return o;
	}]);

app.controller('LoginCtrl', [
	'$scope',
	'$location',
	'$stateParams', 
	function($scope , $location ,$stateParams){
		$scope.title = "This is Title";
	 	console.log('login');
	 $scope.loginSubmit = function() {
	 	console.log('Submit');
		// $window.location.href = '/index.html#home';
		$location.path('/home');
	};
}]);

app.controller('MainCtrl', [
	'$scope',
	'posts' ,
	'$stateParams', 
	function($scope , posts,$stateParams){
	  $scope.test = 'Hello world!';
}]);

})();