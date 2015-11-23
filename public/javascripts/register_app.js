(function(){
var app = angular.module('register_app', ['ui.router','ngMaterial' ]) ;
app.config(function($mdThemingProvider){

                      $mdThemingProvider.theme('default')
                          .primaryPalette('teal')
                          .accentPalette('red')
                          .warnPalette('pink');


              });
app.controller('menuCtrl', function($scope, $mdSidenav) {
                $scope.toggleNav = function(compId)
                {
                  $mdSidenav(compId).toggle();
                };
              });



app.controller('registerCtrl', [
  '$scope',
  '$window',
  '$stateParams', 
  '$http', '$mdDialog',
  function($scope , $window ,$stateParams,$http,$mdDialog){
    $scope.loginSubmit = function() {
      console.log("email : " + this.email + " pw : "+ this.password);
      $window.location = "/home" ;
    };
    $scope.bloodList = [{abv:"A",text:"A"},{abv:"B",text:"B"},{abv:"AB",text:"AB"},{abv:"O",text:"O"},{abv:"X",text:"-"},];
    $scope.genderList = [{abv:"M",gen:"ชาย"},{abv:"F",gen:"หญิง"}];
    $scope.pwNotMatch = false;
    $scope.regData = {};
    $scope.regData.blood_type = 'A';
    $scope.regData.gender = 'M';

    // Validate form and show modal
    $scope.checkRegister = function(ev){
      console.log("check!");
      if($scope.regData.password !== $scope.regData.repeatPassword)
      {
        console.log("not Match");
        $scope.pwNotMatch = true;
        return;
      }
      var confirmCtrl = function($scope, regData) {
          $scope.regData = regData ;
          $scope.cancel = function() {
            $mdDialog.cancel();
          };
          $scope.confirmRegister = function()
          {
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
        };
      $mdDialog.show({
        locals:{regData: $scope.regData},
        controller: confirmCtrl,
        templateUrl: '/dialog/confirmRegister.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true
      })
      .then(function(answer) {
        //Do something after close dialog
        //Switch to another page
      }, function() {
      });

    };

    $scope.resetNotMatchAlert = function()
    { 
      if ($scope.regData.repeatPassword === $scope.regData.password)
       {
        $scope.pwNotMatch = false;
       }
       else {
        $scope.pwNotMatch = true;
       }
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
