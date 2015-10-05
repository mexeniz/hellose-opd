(function(){
var app = angular.module('main', ['ui.router']) ;

<<<<<<< HEAD
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
=======

app.controller('LoginCtrl', [
	'$scope',
	'$window',
	'$stateParams', 
	'$http',
	function($scope , $window ,$stateParams,$http){
		$scope.title = "This is Title"
	 	console.log('login');
	 $scope.loginSubmit = function() {
	 	console.log("email : " + this.email + " pw : "+ this.password);
		$window.location = "/home" ;
>>>>>>> master
	};
}]);

app.controller('MainCtrl', [
	'$scope',
	'$stateParams', 
<<<<<<< HEAD
	function($scope , $stateParams){
	  $scope.goToPatients = function(){
		$location.path('/patients');
	  }
=======
	function($scope , posts,$stateParams){
	  $scope.test = 'Hello world!';

>>>>>>> master
}]);

})();