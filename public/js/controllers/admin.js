
angular.module('app').config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}]);

angular.module('app').controller('Admin', function($scope, $http) {
    $http({
        method:"get",
        url:"/admin/users"
    }).then(function success(response) {
        $scope.users = response.data;
    }, function errorCallback(response) {

    });

    $http({
        method: "get",
        url: "/admin/tasks"
    }).then(function success(response)  {
       $scope.tasks = response.data;
    }, function errorCallback(response) {

    });

    $scope.search = {
        user: {
            customerComparer: {
                min: 0,
                max: 10000
            },
            executerComparer: {
                min: 0,
                max: 10000
            }
        }
    };

    $scope.test = ()=> {
       console.log($scope.search.user.customerComparer.order);
    };

});
