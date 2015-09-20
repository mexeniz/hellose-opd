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


app.controller('LoginCtrl', [
	'$scope',
	'$location',
	'$stateParams', 
	function($scope , $location ,$stateParams){
		$scope.title = "This is Title"
	 	console.log('login');
	 $scope.loginSubmit = function() {
		$location.path('/home');
	};
}]);

app.controller('MainCtrl', [
	'$scope',
	'$stateParams', 
	function($scope , $stateParams){
	  $scope.goToPatients = function(){
		$location.path('/patients');
	  }
}]);

})();