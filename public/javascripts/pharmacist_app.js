(function(){
var app = angular.module('prescriptions', ['ui.router']) ;

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
						o.prescriptions[i].status = 'Completed';
					}
				}
	  	});
	  };

	  return o;
	}]);

app.controller('ListCtrl', [
	'$scope',
	'prescriptions_fac',
	function($scope, prescriptions_fac){
		prescriptions_fac.getList();
		$scope.prescriptions = prescriptions_fac.prescriptions;

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
				{id : 0, name : 'All'},
				{id : 1, name : 'Pending'},
				{id : 2, name : 'Completed'}
			]
		};

		$scope.statusFilterItem = {
			store : $scope.statusFilterOption.stores[0]
		};

		$scope.statusFilter = function(data){
			if ($scope.statusFilterItem.store.name === 'All') {
		    	return true;
		    } else if(data.status === $scope.statusFilterItem.store.name){
				return true;
			}else {
		    	return false;
		  	}
		};

		// Medicine List Detail Modal
		$scope.medicineList = {};

		$scope.showMedicineListModal = false;
		$scope.pharmacistView = true;

		$scope.showMedicineList = function(prescription) {
			$scope.showMedicineListModal = true;
			angular.copy(prescription,$scope.medicineList);
		};

		$scope.completePrescription = function(prescription){
			// update in db
			prescriptions_fac.complete(prescription);
			// fix data in angular
			$scope.showMedicineListModal = false;
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

