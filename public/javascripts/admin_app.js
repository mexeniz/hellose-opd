(function(){
var app = angular.module('admin', ['ui.router', 'ngMaterial', 'ngCsvImport' ,'md.data.table']) ;

// Angular Material Config
app.config(function($mdThemingProvider, $mdIconProvider){

                      $mdThemingProvider.theme('default')
                          .primaryPalette('teal')
                          .accentPalette('cyan')
                          .warnPalette('pink');

              });

// Side menu controller
app.controller('menuCtrl', function($scope, $mdSidenav) {
                $scope.toggleNav = function(compId)
                {
                  $mdSidenav(compId).toggle();
                };
              });

app.factory('users_fac', ['$http', function($http){
  var o = {
    users: []
  };

  o.changeRole = function(user)
  {
    // var role ={
    //   isDoctor : user.isDoctor,
    //   isNurse : user.isNurse,
    //   isPharmacist : user.isPharmacist,
    //   isStaff : user.isStaff,
    //   department : user.department
    // };
    return $http.post('/user/' + user.id, user).success(function(result){
        // o.users.push(data);
      for(var i = 0; i < o.users.length; i++)
      {
        if(o.users[i].id === user.id)
        {
          o.users[i] = user;
          break;
        }
      }
      });
  };

  o.getList = function()
  {
    return $http.get('/store/user').success(function(data){
        for(var i = 0  ; i < data.length  ; i++){
          o.users.push(data[i]);
        }
        console.log(o.users);
      });
  };

  o.delete = function(user)
  {
    return $http.post('/user/' + user._id + '/delete').success(function(result){
      for(var i = 0; i < o.users.length; i++)
      {
        if(o.users[i]._id === user._id)
        {
          o.users.splice(i,1);
          break;
        }
      }
      // console.log(result);
    });
  };
  return o;
}]);

app.factory('diseases_fac', ['$http', function($http){
  var o = {
    diseases: []
  };

  o.getList = function()
  {
    return $http.get('/store/disease').success(function(data){
        for(var i = 0  ; i < data.length  ; i++){
          o.diseases.push(data[i]);
        }
      });
  };

  o.add = function(disease)
  {
    return $http.post('/disease/add', disease).success(function(data){
        o.diseases.push(data);
      });
  };

  o.update = function(disease)
  {
    return $http.post('disease/' + disease._id + '/edit', disease).success(function(result){
      for(var i = 0; i < o.diseases.length; i++)
      {
        if(o.diseases[i]._id === disease._id)
        {
          o.diseases[i] = disease;
          break;
        }
      }
    });
  };

  o.delete = function(disease)
  {
    return $http.post('/disease/' + disease._id + '/delete').success(function(result){
      for(var i = 0; i < o.diseases.length; i++)
      {
        if(o.diseases[i]._id === disease._id)
        {
          o.diseases.splice(i,1);
          break;
        }
      }
    });
  };
  return o;
}]);

app.factory('medicines_fac', ['$http', function($http){
  var o = {
    medicines: []
  };

  o.getList = function()
  {
    return $http.get('/store/medicine').success(function(data){
        for(var i = 0  ; i < data.length  ; i++){
          o.medicines.push(data[i]);
        }
      });
  };

  o.add = function(medicine)
  {
    return $http.post('/medicine/add', medicine).success(function(data){
        o.medicines.push(data);
      });
  };

  o.update = function(medicine)
  {
    return $http.post('medicine/' + medicine._id + '/edit', medicine).success(function(result){
      for(var i = 0; i < o.medicines.length; i++)
      {
        if(o.medicines[i]._id === medicine._id)
        {
          o.medicines[i] = medicine;
          break;
        }
      }
    });
  };

  o.delete = function(medicine)
  {
    return $http.post('/medicine/' + medicine._id + '/delete').success(function(result){
      for(var i = 0; i < o.medicines.length; i++)
      {
        if(o.medicines[i]._id === medicine._id)
        {
          o.medicines.splice(i,1);
          break;
        }
      }
    });
  };
  return o;
}]);

app.factory('departments_fac', ['$http', function($http){
  var o = {
    departments: []
  };

  o.getList = function()
  {
    return $http.get('/store/department').success(function(data){
        angular.copy(data,o.departments);
      });
  };

  o.add = function(department)
  {
    return $http.post('/department/add', department).success(function(data){
        o.departments.push(data);
      });
  };

  o.update = function(department)
  {
    return $http.post('department/' + department._id + '/edit', department).success(function(result){
      for(var i = 0; i < o.departments.length; i++)
      {
        if(o.departments[i]._id === department._id)
        {
          o.departments[i] = department;
          break;
        }
      }
    });
  };

  o.delete = function(department)
  {
    return $http.post('/department/' + department._id + '/delete').success(function(result){
      for(var i = 0; i < o.departments.length; i++)
      {
        if(o.departments[i]._id === department._id)
        {
          o.departments.splice(i,1);
          break;
        }
      }
    });
  };
  return o;
}]);


app.controller('ListCtrl', [
  '$scope',
  '$q',
  'users_fac',
  'departments_fac',
  '$mdDialog',
  function($scope,$q, users_fac,departments_fac,$mdDialog){
    users_fac.getList();
    $scope.users = users_fac.users;
    $scope.selected = [];
  
      $scope.query = {
       order: 'username',
       limit: 5,
        page: 1
    };

    $scope.onpagechange = function(page, limit) {
        var deferred = $q.defer();
        
        setTimeout(function () {
          deferred.resolve();
        }, 2000);
        
        return deferred.promise;
      };
    
    $scope.onorderchange = function(order) {
        var deferred = $q.defer();
        
        setTimeout(function () {
          deferred.resolve();
        }, 2000);
        
        return deferred.promise;
      };

    //Filter
     $scope.fullnameOrIdFilterItem = {
      store : ''
    };

    $scope.fullnameOrIdFilter = function(data){
      var fullname = (data.username).toLowerCase();
      var input = $scope.fullnameOrIdFilterItem.store.trim().toLowerCase();
      return fullname.indexOf(input) !== -1 || data.username.indexOf(input) !== -1;
    };

    $scope.doctorToggle = function(ev, user){
      if(user.isDoctor){
        $scope.toggle(user,'Doctor');
      }else{
        $scope.selectDepartment(ev, user);
      }
    };

    $scope.toggle = function(user, toggleRole){
      //copy user to newUser
      var newUser = JSON.parse(JSON.stringify(user));
      $scope.changeRole(newUser, toggleRole);
    };

    $scope.changeRole = function(user, toggleRole){
      // toggle role
      switch(toggleRole){
        case 'Doctor' : user.isDoctor = !user.isDoctor; break;
        case 'Nurse': user.isNurse = !user.isNurse; break;
        case 'Pharmacist' : user.isPharmacist = !user.isPharmacist; break;
        case 'Staff' : user.isStaff = !user.isStaff; break;
      }
      // console.log(user);
      users_fac.changeRole(user);
    };

    $scope.selectDepartment = function(ev, user){
      var selectDepartmentCtrl = function($scope , departments_fac, users_fac, user){
          departments_fac.getList();
          $scope.departmentList = departments_fac.departments;
          $scope.department = $scope.departmentList[0];
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
            $scope.select = function(){
              user.department = $scope.department;
              $mdDialog.hide(user);
            };
          };

        $mdDialog.show({
          locals:{users_fac : users_fac , departments_fac: departments_fac, user : user},
          controller: selectDepartmentCtrl,
          templateUrl: '/dialog/selectDepartment.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true
        })
        .then(function(user) {
          $scope.toggle(user, 'Doctor');
        }, function() {
        });
    };
  }
]);

app.controller('MedicineListCtrl', [
  '$scope',
  '$q',
  'medicines_fac',
  '$mdDialog',

  function($scope,$q, medicines_fac,$mdDialog){
    medicines_fac.getList();
    $scope.medicines = medicines_fac.medicines;
    $scope.selected = [];
  
      $scope.query = {
       order: 'username',
       limit: 5,
        page: 1
    };

    $scope.onpagechange = function(page, limit) {
        var deferred = $q.defer();
        
        setTimeout(function () {
          deferred.resolve();
        }, 2000);
        
        return deferred.promise;
      };
    
    $scope.onorderchange = function(order) {
        var deferred = $q.defer();
        
        setTimeout(function () {
          deferred.resolve();
        }, 2000);
        
        return deferred.promise;
      };

    $scope.showMedicineForm = function(ev,mode, medicine){
      var createMedicineCtrl = function($scope , medicines_fac , medicine){
          $scope.medicine = {name:[]};
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
            $scope.submitMedicine = function(){
              medicines_fac.add($scope.medicine);
              $mdDialog.cancel();
            };
          };
        var editMedicineCtrl = function($scope , medicines_fac , medicine){
          console.log(medicine);
          $scope.medicine = medicine ;
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
            $scope.submitMedicine = function(){
              medicines_fac.update($scope.medicine);
              $mdDialog.cancel();
            };
          };
        var mCtrl = {};
        if (mode === 'edit'){
          mCtrl = editMedicineCtrl ;
        }
        else{
          mCtrl = createMedicineCtrl ;
        }
        $mdDialog.show({
          locals:{medicines_fac : medicines_fac , medicine : JSON.parse(JSON.stringify(medicine))},
          controller: mCtrl,
          templateUrl: '/dialog/createMedicine.html',
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

    $scope.removeMedicine = function(medicine){

      if(confirm("Are you sure?") ){
        medicines_fac.delete(medicine);
      }
    };
}]);

app.controller('DepartmentListCtrl', [
  '$scope',
  '$q',
  'departments_fac',
  '$mdDialog',

  function($scope,$q, departments_fac,$mdDialog){
    departments_fac.getList();
    $scope.departments = departments_fac.departments;
    $scope.selected = [];
  
      $scope.query = {
       order: 'username',
       limit: 5,
        page: 1
    };

    $scope.onpagechange = function(page, limit) {
        var deferred = $q.defer();
        
        setTimeout(function () {
          deferred.resolve();
        }, 2000);
        
        return deferred.promise;
      };
    
    $scope.onorderchange = function(order) {
        var deferred = $q.defer();
        
        setTimeout(function () {
          deferred.resolve();
        }, 2000);
        
        return deferred.promise;
      };

    $scope.showDepartmentForm = function(ev,mode, department){
        var createDepartmentCtrl = function($scope , departments_fac , department){
          $scope.department = {name:[]};
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
            $scope.submitDepartment = function(){
              departments_fac.add($scope.department);
              $mdDialog.cancel();
            };
          };
        var editDepartmentCtrl = function($scope , departments_fac , department){
          $scope.department = department ;
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
            $scope.submitDepartment = function(){
              departments_fac.update($scope.department);
              $mdDialog.cancel();
            };
          };
        var mCtrl = {};
        if (mode === 'edit'){
          mCtrl = editDepartmentCtrl ;
        }
        else{
          mCtrl = createDepartmentCtrl ;
        }
        $mdDialog.show({
          locals:{departments_fac : departments_fac , department : JSON.parse(JSON.stringify(department))},
          controller: mCtrl,
          templateUrl: '/dialog/createDepartment.html',
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

    $scope.removeDepartment = function(department){
      
      if(confirm("Are you sure?") ){
        departments_fac.delete(department);
      }
    };
}]);


app.controller('DiseaseListCtrl', [
  '$scope',
  '$q',
  'diseases_fac',
  '$mdDialog',

  function($scope,$q, diseases_fac,$mdDialog){
    diseases_fac.getList();
    $scope.diseases = diseases_fac.diseases;
    $scope.selected = [];
  
      $scope.query = {
       order: 'username',
       limit: 5,
        page: 1
    };

    $scope.onpagechange = function(page, limit) {
        var deferred = $q.defer();
        
        setTimeout(function () {
          deferred.resolve();
        }, 2000);
        
        return deferred.promise;
      };
    
    $scope.onorderchange = function(order) {
        var deferred = $q.defer();
        
        setTimeout(function () {
          deferred.resolve();
        }, 2000);
        
        return deferred.promise;
      };

    $scope.showDiseaseForm = function(ev,mode, disease){
        var createDiseaseCtrl = function($scope , diseases_fac , disease){
          $scope.disease = {disease_id:[],disease_id_type:[],name:[]};
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
            $scope.submitDisease = function(){
              diseases_fac.add($scope.disease);
              $mdDialog.cancel();
            };
          };
        var editDiseaseCtrl = function($scope , diseases_fac , disease){
          $scope.disease = disease ;
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
            $scope.submitDisease = function(){
              diseases_fac.update($scope.disease);
              $mdDialog.cancel();
            };
          };
        var mCtrl = {};
        if (mode === 'edit'){
          mCtrl = editDiseaseCtrl ;
        }
        else{
          mCtrl = createDiseaseCtrl ;
        }
        $mdDialog.show({
          locals:{diseases_fac : diseases_fac , disease : JSON.parse(JSON.stringify(disease))},
          controller: mCtrl,
          templateUrl: '/dialog/createDisease.html',
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

    $scope.removeDisease = function(disease){
      
      if(confirm("Are you sure?") ){
        diseases_fac.delete(disease);
      }
    };
}]);

})();