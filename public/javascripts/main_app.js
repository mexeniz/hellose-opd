(function(){
var app = angular.module('main', ['ui.router']) ;

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	'$locationProvider',
	function($stateProvider, $urlRouterProvider ,$locationProvider) {

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
	  $locationProvider.html5Mode(true);
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
	function($scope , posts,$stateParams){
	  $scope.test = 'Hello world!';

}]);

})();