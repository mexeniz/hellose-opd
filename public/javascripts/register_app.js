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
      if($scope.regData.password !== $scope.regData.repeatPassword)
      {
        $scope.pwNotMatch = true;
        return;
      }
      var confirmCtrl = function($scope, regData) {
          $scope.regMessage = "" ;
          $scope.regData = regData ;
          $scope.cancel = function() {
            $mdDialog.cancel();
          };
          $scope.confirmRegister = function()
          {
            $http.post('/register', $scope.regData).success(function(data) {
              if(data.status === 'success')
              {
                $scope.regMessage = 'ลงทะเบียนสำเร็จ';
                $window.location.href = "/home" ;
              }
              else
              {
                $scope.regMessage = 'Email ถูกใช้ลงทะเบียนไปแล้ว';
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
        $window.location.href = "/home" ;
      }
    );

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

        if(data.status === 'success')
        {
          $scope.regMessage = 'ลงทะเบียนสำเร็จ';
          setTimeout(function(){
              $mdDialog.hide() ;
          },2000);
        }
        else
        {
          $scope.regMessage = 'พบข้อผิดพลาด กรุณาตรวจสอบข้อมูใหม่';
        }
      });
    };

}]);
app.controller('resetPasswordCtrl', ['$scope','$window', '$http', '$mdDialog',
  function($scope , $window ,$http,$mdDialog){
    $scope.email = "" ;
    // Validate form and show modal
    $scope.resetPassword = function(ev){
      var modalCtrl = function($scope,$window, text , status) {
          $scope.text = text ;
          $scope.showProgress = true ;
          $scope.finishProgress = false ;
          setTimeout(function(){
              $scope.showProgress = false;
              $scope.finishProgress = true ;
              console.log(status);
          }, 2000);
          $scope.cancel = function() {
            $mdDialog.cancel();
          };
          $scope.confirm = function()
          {
            $mdDialog.hide('text');
          };
        };
      $http.post('/reset_password', {email : $scope.email}).success(function(res) {
          var text = "" ;
          if (res.status === 'success'){
            text = "ทำการรีเซ็ตรหัสผ่านสำเร็จ กรุณาตรวจสอบEmailที่ได้รับ";
          }else{
            text = "ไม่พบEmailนี้ในระบบ" ;
          }
          // Initiate Modal
          $mdDialog.show({
            locals:{text : text , status : res.status},
            controller: modalCtrl,
            templateUrl: '/dialog/resetPasswordDialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
          })
          .then(function(answer) {
            //Do something after close dialog
            //Switch to another page
            console.log(answer);
          });   
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
