(function(){
var app = angular.module('main', ['ui.router']) ;


app.controller('LoginCtrl', [
	'$scope',
	'$window',
	'$stateParams', 
	'$http',
	function($scope , $window ,$stateParams,$http){
    $scope.role = 1;
	 	$scope.loginSubmit = function() {
      console.log('Logging in');
      $http.post('/login', { username: $scope.username, password: $scope.password, role: $scope.role })
        .success(function(data)
        {
          if(data.status === 'failed')
          {
            if(data.message.length > 0)
              $scope.message = data.message[0];
          }
          else
          {
            $window.location.href = "/home";
          }
        });
		};

		$scope.showRegModal = false;
		$scope.showRegister = function(){
			$scope.showRegModal = !$scope.showRegModal ;
			console.log($scope.showRegModal) ;
		};
}]);

app.controller('MainCtrl', [
	'$scope',
	'$stateParams', 
	function($scope , posts,$stateParams){
	  $scope.test = 'Hello world!';

}]);

app.directive('modal', function () {
    return {
      template: '<div class="modal fade">' +
          '<div class="modal-dialog">' +
            '<div class="modal-content">' +
              '<div class="modal-header">' +
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                '<h4 class="modal-title">{{ title }}</h4>' +
              '</div>' +
              '<div class="modal-body" ng-transclude></div>' +
            '</div>' +
          '</div>' +
        '</div>',
      restrict: 'E',
      transclude: true,
      replace:true,
      scope:true,
      link: function postLink(scope, element, attrs) {
        scope.title = attrs.title;

        scope.$watch(attrs.visible, function(value){
          if(value === true)
            $(element).modal('show');
          else
            $(element).modal('hide');
        });

        $(element).on('shown.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = true;
          });
        });

        $(element).on('hidden.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = false;
          });
        });
      }
    };
  });

})();
