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
            window.location.href="/request/get";
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

    $scope.EditTask = function(task_id) {
        $scope.my_tasks.forEach((task)=> {
           task.deadline = new Date(task.deadline);
        });
        var modal_id = `#modal_${task_id}`;
        $(modal_id).modal('show');
    };
    $scope.DeleteTask = function(task_id) {
      var answer = confirm("Вы действительно хотите удалить задание");
      if (answer) {
          $http({
              url: '/user/tasks/delete',
              method: 'post',
              data: {
                  task_id: task_id
              }
          }).then(function successCallback(response) {
                $scope.my_tasks.forEach((my_task,index,tasks)=> {
                   if (my_task._id == task_id) tasks.splice(index,1);
                });
          }, function errorCallback(response) {
              alert("error");
          });
      }
    };


    $scope.update = function(ev,id) {
        var formData = new FormData(ev.currentTarget);
        formData.append("id",id);
        $http({
            url: '/task/update',
            method: 'post',
            data: formData,
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).then((response) => {
           alert('success');
        }, (response)=> {
            alert('error');
        });
    }
});

$(document).ready(function() {

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
