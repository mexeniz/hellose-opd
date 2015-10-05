(function(){
var app = angular.module('main', ['ui.router']) ;


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
	};
}]);

app.controller('MainCtrl', [
	'$scope',
	'$stateParams', 
	function($scope , posts,$stateParams){
	  $scope.test = 'Hello world!';

}]);

})();