var myApp = angular.module('app', []);

myApp.controller('TaskCtrl', function($scope, $http) {

    $http.get('/task/getTasks').success(function(data) {
        $scope.tasks = data;
        $scope.$apply();
    });

    $scope.ClickTaskHeader = function(id) {
        $("#" + id).next().slideToggle();
    };

    $scope.SendRequest = function(task_author,task_id) {
        $("#modal_message").modal('show');
        $("#modal_message .yes").click(function() {
            $http({
                url: '/request/add',
                method: 'post',
                data: {
                    author: task_author,
                    task_id: task_id,
                    message:  $("#modal_message .message").val()
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
        $("input[name='category_name']").val($("a.active").html());
        $("input[name='category_id']").val($("a.active").attr("data-id"));

    });
    $('.prev').click(function() {
        owl.trigger('owl.prev');
    });


});
