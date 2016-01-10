var myApp = angular.module('app', []);

myApp.controller('PortfolioCtrl', function($scope, $http) {
        $http.get('user/getWorks').success(function(data) {
            $scope.works = data;
            $scope.$apply();
        });
    });