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
    console.log(user.id);
    return $http.post('/user/' + user.id, user).success(function(result){
        // o.users.push(data);
      console.log(result);
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
    console.log('getHere');
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

  o.add = function(disease)
  {
    return $http.post('/disease/add', disease).success(function(data){
        o.diseases.push(data);
      });
  };

  o.update = function(disease)
  {
    return $http.post('disease/' + disease._id + '/edit', disease).success(function(result){
      for(var i = 0; i < o.disease.length; i++)
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

  o.add = function(department)
  {
    return $http.post('/department/add', department).success(function(data){
        o.departments.push(data);
      });
  };

  o.update = function(department)
  {
    return $http.post('department/' + department._id + '/edit', department).success(function(result){
      for(var i = 0; i < o.department.length; i++)
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
  '$timeout',

  function($scope,$q, users_fac,$timeout){
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

    $scope.toggle = function(user, toggleRole){
      //copy user to newUser
      var newUser = JSON.parse(JSON.stringify(user));
      if(toggleRole === 'Doctor'){

      }else{
        $scope.changeRole(newUser, toggleRole);
      }
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
  }
]);


})();