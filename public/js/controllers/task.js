var myApp = angular.module('app', []);

myApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}]);

myApp.controller('TaskCtrl', function($scope, $http) {
    $http.get('/task/getTasks').success(function(data) {
        $scope.tasks = data;
    });

    $scope.ClickTaskHeader = function(id) {
        $("#" + id).next().slideToggle();
    };

    $scope.SendRequest = function(task_id) {
        $("#modal_message").modal('show');
        $("#modal_message .yes").click(function(e) {
            $http({
                url: '/request/add',
                method: 'post',
                data: {
                    task_id: task_id,
                    message:  $("#modal_message .message").val(),
                    headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
                }
            }).then(function successCallback(response) {
                $('#modal_message').modal('toggle');
            }, function errorCallback(response) {
                alert("error");
            });
        });
    };
});

$(document).ready(function() {

    var owl = $("#owl-carousel");
    owl.owlCarousel({
        singleItem: true,
        mouseDrag: false,
        touchDrag: false,
        pagination: false
    });
    $('.continue').click(function() {
        owl.trigger('owl.next');
        $("input[name='category_name']").val($("a.active").html().split('(')[0]);
        $("input[name='category_id']").val($("a.active").attr("data-id"));

    });
    $('.prev').click(function() {
        owl.trigger('owl.prev');
    });


});
