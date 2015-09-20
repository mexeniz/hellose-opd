(function(){
	var app = angular.module('physicalrecords', ['ui.router']) ;

	app.factory('info', ['$http', function($http){
		return {
			getInfo: function(id) {
				return $http.get('/patients/infostore?patient=' + id);
			}
		}	  
	}]);

	app.controller('InfoCtrl', [
		'$scope',
		'info',
		function($scope, info){
		  var url = window.location.href;
		  var token = url.split('/');
		  var id = token[token.length-1];
		  info.getInfo(id).success(function(data) {
		  	$scope.info = data;
		  });
		}
	]);
})();