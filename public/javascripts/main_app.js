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
	 	$http.post('/login', { username: $scope.username, password: $scope.password }).success(function(data) {
	 		console.log(data);
	 	});
	};
}]);

app.controller('MainCtrl', [
	'$scope',
	'$stateParams', 
	function($scope , posts,$stateParams){
	  $scope.test = 'Hello world!';

}]);

})();