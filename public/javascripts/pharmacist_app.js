(function(){
var app = angular.module('prescriptions', ['ui.router', 'ngMaterial']) ;

app.factory('prescriptions_fac', ['$http', function($http){
	  var o = {
	  	prescriptions : []
	  };
	  
	  o.getList = function(){
	  	return $http.get('list').success(function(data){
	      for(var i = 0  ; i < data.length  ; i++){
					o.prescriptions.push(data[i]);
					console.log(o.prescriptions[o.prescriptions.length-1]);
				}
	    });
	  };

	  o.complete = function(prescription){
	  	return $http.post('complete/' + prescription._id).success(function(){
			for(var i = 0  ; i < o.prescriptions.length  ; i++){
					if(prescription._id === o.prescriptions[i]._id){
						o.prescriptions[i].status = 'จ่ายแล้ว';
					}
				}
	  	});
	  };

	  return o;
	}]);

app.controller('ListCtrl', [
	'$scope',
	'$q',
	'prescriptions_fac',
	'$mdDialog',

	function($scope,$q, prescriptions_fac,$mdDialog){
		prescriptions_fac.getList();
		$scope.prescriptions = prescriptions_fac.prescriptions;
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

		// Custom Filter by Full Name
		$scope.fullnameFilterItem = {
			store : ''
		};

		$scope.fullnameFilter = function(data){
			var fullname = (data.patient.firstname + " " + data.patient.lastname).toLowerCase();
			return fullname.indexOf($scope.fullnameFilterItem.store.trim().toLowerCase()) !== -1;
		};

		// Custom Filter by Status
		$scope.statusFilterOption = {
			stores : [
				{id : 0, name : 'ทั้งหมด'},
				{id : 1, name : 'รอการจ่าย'},
				{id : 2, name : 'จ่ายแล้ว'}
			]
		};

		$scope.statusFilterItem = {
			store : $scope.statusFilterOption.stores[0]
		};

		$scope.statusFilter = function(data){
			if ($scope.statusFilterItem.store.id === 0) {
		    	return true;
		    } else if(data.status === $scope.statusFilterItem.store.name){
				return true;
			}else {
		    	return false;
		  	}
		};
	}
]);


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
        	if(value === true){
        		$(element).modal('show');
        	}else{
        		$(element).modal('hide');
        	}
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

