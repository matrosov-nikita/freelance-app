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
                window.location.href = response.data;
            },
            function error(xhr) {
                error_callback($scope, xhr.status,xhr.data.message);
            });
    });
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
                error_callback($scope, xhr.status,xhr.data.message);
            });
    });
});


function error_callback(scope, status, data) {

    switch(status) {
        case 403:
        case 404:
        {
            scope.valid_mes = data;
            scope.valid_errors = null;
            break;
        }
        case 422:
        {
            scope.valid_mes = "";
            scope.valid_errors = data;
            break;
        }
        default:
            alert("Another error");
            break;
    }
}

$(document).ready(function() {
    $("#tabs li>a").on("click",function() {
    $("#tabs li").removeClass("active");
    var link = $(this).attr("href");
    $(link).removeClass("active").addClass("fade");
    });

    $("#addwork").click(function() {
       $("#upload").slideToggle();
    });
    if (!access) {
        $("input,textarea,button").prop("disabled", true);
        $(".modal button").prop("disabled", false);
    }

});






