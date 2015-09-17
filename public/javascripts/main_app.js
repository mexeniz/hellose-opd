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
	 //  o.upvote = function(post) {
		//   return $http.put('/posts/' + post._id + '/upvote')
		//     .success(function(data){
		//       post.upvotes += 1;
		//     });
		// };
	 //  o.get = function(id) {
		//   return $http.get('/posts/' + id).then(function(res){
		//   	console.log(res.data);
		//     return res.data;
		//   });
		// };
	 //  o.addComment = function(id, comment) {
  // 			return $http.post('/posts/' + id + '/comments', comment);
		// };
	 //  o.upvoteComment = function(post, comment) {
		//   return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote')
		//     .success(function(data){
		//       comment.upvotes += 1;
		//     });
		// };
	  return o;
	}]);

app.controller('LoginCtrl', [
	'$scope',
	'$location',
	'$stateParams', 
	function($scope , $location ,$stateParams){
		$scope.title = "This is Title"
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