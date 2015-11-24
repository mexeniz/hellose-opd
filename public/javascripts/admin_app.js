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

  o.changeRole = function(user, role)
  {
    return $http.post('/user/' + user._id, role).success(function(data){
        // o.users.push(data);
      });
  };

  o.get = function()
  {
    return $http.get('/store/user').success(function(data){
        for(var i = 0  ; i < data.length  ; i++){
          o.users.push(data[i]);
        }
      });
  };

  o.delete = function(user)
  {
    return $http.post('/disease/' + user._id + '/delete').success(function(data){
      for(var i = 0; i < o.disease.length; i++)
      {
        if(o.users[i]._id === data._id)
        {
          o.users.splice(i,1);
          break;
        }
      }
      // console.log(result);
    });
  };

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
    return $http.post('disease/' + disease._id + '/edit', disease).success(function(data){
      for(var i = 0; i < o.disease.length; i++)
      {
        if(o.diseases[i]._id === data._id)
        {
          o.diseases[i] = data;
          break;
        }
      }
    });
  };

  o.delete = function(disease)
  {
    return $http.post('/disease/' + disease._id + '/delete').success(function(data){
      for(var i = 0; i < o.diseases.length; i++)
      {
        if(o.diseases[i]._id === data._id)
        {
          o.diseases.splice(i,1);
          break;
        }
      }
    });
  };
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
    return $http.post('medicine/' + medicine._id + '/edit', medicine).success(function(data){
      for(var i = 0; i < o.medicines.length; i++)
      {
        if(o.medicines[i]._id === data._id)
        {
          o.medicines[i] = data;
          break;
        }
      }
    });
  };

  o.delete = function(medicine)
  {
    return $http.post('/medicine/' + medicine._id + '/delete').success(function(data){
      for(var i = 0; i < o.medicines.length; i++)
      {
        if(o.medicines[i]._id === data._id)
        {
          o.medicines.splice(i,1);
          break;
        }
      }
    });
  };
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
    return $http.post('department/' + department._id + '/edit', department).success(function(data){
      for(var i = 0; i < o.department.length; i++)
      {
        if(o.departments[i]._id === data._id)
        {
          o.departments[i] = data;
          break;
        }
      }
    });
  };

  o.delete = function(department)
  {
    return $http.post('/department/' + department._id + '/delete').success(function(data){
      for(var i = 0; i < o.departments.length; i++)
      {
        if(o.departments[i]._id === data._id)
        {
          o.departments.splice(i,1);
          break;
        }
      }
    });
  };
}]);

})();