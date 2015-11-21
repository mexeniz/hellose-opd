(function(){
var app = angular.module('register_app', ['ui.router','ngMaterial' ]) ;
app.config(function($mdThemingProvider, $mdIconProvider){

                  /*$mdIconProvider
                      .defaultIconSet("./assets/svg/avatars.svg", 128)
                      .icon("menu"       , "./assets/svg/menu.svg"        , 24)
                      .icon("share"      , "./assets/svg/share.svg"       , 24)
                      .icon("google_plus", "./assets/svg/google_plus.svg" , 512)
                      .icon("hangouts"   , "./assets/svg/hangouts.svg"    , 512)
                      .icon("twitter"    , "./assets/svg/twitter.svg"     , 512)
                      .icon("phone"      , "./assets/svg/phone.svg"       , 512);*/

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
  '$http',
  function($scope , $window ,$stateParams,$http){
    $scope.loginSubmit = function() {
      console.log("email : " + this.email + " pw : "+ this.password);
      $window.location = "/home" ;
    };
    $scope.bloodList = ["A","B","AB","O"];
    $scope.genderList = [{abb:"M",gen:"Male"},{abb:"F",gen:"Female"}];
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
