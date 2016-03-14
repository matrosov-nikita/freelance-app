
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

});