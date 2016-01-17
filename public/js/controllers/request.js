var myApp = angular.module('app', []);
myApp.controller('RequestCtrl', function($scope, $http) {
    $http.get('/request/getRequests').success(function(data) {
        $scope.requests = data;
    });
    $http.get('/request/getOwnRequests').success(function(data) {
        $scope.own_requests = data;
    });


});