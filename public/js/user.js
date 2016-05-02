var myApp = angular.module('app', []);

myApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}]);

myApp.controller('RegisterCtrl', function ($scope, $http) {
    $("#register").submit(function() {
        var form = $(this).serialize();
        $http({
            url: '/user/register',
            method: 'post',
            data: form,
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(function success(response) {
            console.log(response.data);
                window.location.href = response.data;
            },
            function error(xhr) {
                error_callback($scope.registerForm, xhr.data,'Ошибка регистрации');
            });
    });
    $scope.isEmpty = (obj) => {
        return !$.isEmptyObject(obj);
    };
});

myApp.controller('AuthCtrl', function ($scope, $http) {
    $("#authorize").submit(function() {
        var form = $(this).serialize();
            $http({
                url: '/user/authorize',
                method: 'post',
                data: form,
                headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(function success(response) {
                window.location.href = response.data;
            },
            function error(xhr) {
                error_callback($scope, xhr.data,'Ошибка авторизации');
            });
    });
});






