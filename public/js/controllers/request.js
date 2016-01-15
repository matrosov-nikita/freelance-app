var myApp = angular.module('app', []);
myApp.controller('RequestCtrl', function($scope, $http) {
    $http.get('/request/getRequests').success(function(data) {
        $scope.requests = data;
    });
});