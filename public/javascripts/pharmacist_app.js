(function(){
var app = angular.module('prescriptions', ['ui.router']) ;

app.factory('prescriptions_fac', ['$http', function($http){
	  var o = {
	  	prescriptions : [
	  	{"date":100,"patient_name":'นายก',"patient_lastname":'ตู่',"status":"รอการจ่าย"},
	  	{"date":200,"patient_name":'เอ็มม่า',"patient_lastname":'ราชาลิง',"status":"จ่ายแล้ว"},
	  	{"date":150,"patient_name":'แมวน้ำ',"patient_lastname":'เอฟซี',"status":"รอการจ่าย"},
	  	{"date":250,"patient_name":'mike',"patient_lastname":'miller',"status":"จ่ายแล้ว"},
	  	]
	  };
	  
	  o.getList = function(){
	  	return o.prescriptions;
	  };

	  return o;
	}]);

app.controller('ListCtrl', [
	'$scope',
	'prescriptions_fac',
	function($scope, prescriptions_fac){
		prescriptions_fac.getList();
		$scope.prescriptions = prescriptions_fac.prescriptions;

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
			if ($scope.statusFilterItem.store.name === 'ทั้งหมด') {
		    	return true;
		    } else if(data.status === $scope.statusFilterItem.store.name){
				return true;
			}else {
		    	return false;
		  	}
		};

		$scope.showMedicineListModal = false;
		$scope.showMedicineList = function() {
			$scope.showMedicineListModal = true;
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

