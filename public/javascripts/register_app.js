(function(){
var app = angular.module('register_app', ['ui.router']) ;


app.controller('registerController', [
	'$scope',
	'$window',
	'$stateParams', 
	'$http',
	function($scope , $window ,$stateParams,$http){
	 	$scope.loginSubmit = function() {
	 		console.log("email : " + this.email + " pw : "+ this.password);
			$window.location = "/home" ;
		};

		$scope.showConfirmRegModal = false;
    $scope.pwNotMatch = false;
    $scope.regData = {};
    $scope.regData.blood_type = 'A';
    $scope.regData.gender = 'M';

    // Validate form and show modal
		$scope.checkRegister = function(){
      if($scope.password !== $scope.repeatPassword)
      {
        $scope.pwNotMatch = true;
        return;
      }
			$scope.showConfirmRegModal = true;
		};

    $scope.resetNotMatchAlert = function()
    {
      $scope.pwNotMatch = false;
    };

    $scope.confirmRegister = function()
    {
      $scope.showConfirmRegModal = false;
      $http.post('/register', $scope.regData).success(function(data) {
        console.log(data);
        if(data.status === 'success')
        {
          $scope.regMessage = 'Successfully registered!';
          $window.location.href = "/home" ;
        }
        else
        {
          $scope.regMessage = 'Try again!';
        }
      });
    };

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

app.directive('pwCheck', [function () {
  return {
    require: 'ngModel',
    link: function (scope, elem, attrs, ctrl) {
      var firstPassword = '#' + attrs.pwCheck;
      elem.add(firstPassword).on('keyup', function () {
        scope.$apply(function () {
          var v = elem.val()===$(firstPassword).val();
          ctrl.$setValidity('pwMatch', v);
        });
      });
    }
  };
}]);

})();
