var myApp = angular.module('app',  []);

myApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}]);

myApp.controller('TaskCtrl', function($scope, $http) {
    $http.get('/task/getTasks').success(function(data) {
        $scope.tasks = data;
    });
    $scope.continue = ()=>{
        $scope.task = { };
        $scope.task.category_name = $("a.active").html().split('(')[0] || "Другое";
        $scope.task.category_id = $("a.active").attr("data-id") || "56856a20816c907ccd39026f";
    };

    $scope.submit = ()=> {
        $http({
            url: "/task/add",
            method: 'post',
            data: new FormData($("#addtask")[0]),
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).success((resp)=> {

        }).error((resp)=> {
            for (var key in $scope.addForm)
            {
                if ($scope.addForm[key] && $scope.addForm[key].$error) {
                    $scope.addForm[key].$error = {};
                }
            }
            for (key in resp.error) {
                $scope.addForm[key].$error = resp.error[key].message;
            }
        });
    };

    $scope.ClickTaskHeader = function(id) {
        $("#" + id).next().slideToggle();
    };

    $scope.isEmpty = (obj) => {
       return !$.isEmptyObject(obj);
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


    $("#dispute").click(function() {
        $("#dispute_form").slideToggle();

    });
    var owl = $("#owl-carousel");
    owl.owlCarousel({
        singleItem: true,
        mouseDrag: false,
        touchDrag: false,
        pagination: false,
        rewindNav:false
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
