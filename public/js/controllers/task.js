

angular.module('app').controller('TaskCtrl', function($scope, $http) {

    $scope.selectedIndex = 0;

    $scope.itemClicked = (index)=> {
        $scope.selectedIndex = index;
    };

    $scope.getTasks = (page) => {
        $http.get('/task/getTasks?page='+page).success(function(data) {
            $scope.tasks = data;
        });
    };

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

            error_callback($scope.addForm,resp,'Ошибка добавления задания');
        });
    };

    $scope.range = () => {
        var pages = [];
        for(var i = 0; i < $scope.pageCount; i++)
        {
            pages.push(i+1);
        }
        return pages;
    };

    $scope.getCount = () => {
      $http({
          method: "get",
          url: "/task/count"
      }).then(
          success = (resp) => {
              $scope.pageCount = resp.data;
          },
          error = ()=> {

          }
      )
    };

    $scope.sendResult = () => {
        $http({
            url: "/request/sendresult",
            method: 'post',
            data: new FormData($("#sendresult")[0]),
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).success((resp)=> {
            window.location.href="/request/getown";
        }).error((resp)=> {
            error_callback($scope.sendresult,resp,"Не удалось отправить работу заказчику");
        });
    };

    $scope.ClickTaskHeader = function(id) {
        $("#" + id).next().slideToggle();
    };
    $scope.isEmpty = (obj) => {
        return !$.isEmptyObject(obj);
    };

    $scope.OpenRequest = function(task_id) {
        $("#modal_message").modal('show');
        $scope.openTask = task_id;
    };
    $scope.result = {};
    $scope.SendRequest = function() {
        $scope.result.task_id = $scope.openTask;
        $http({
            url: '/request/add',
            method: 'post',
            data: $scope.result
        }).then(function successCallback(response) {
            $('#modal_message').modal('toggle');
            window.location.href="/request/getown";
        }, function errorCallback(response) {
            error_callback($scope.addRequest,response.data,'Не удалось отправить заявку')
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
        swal({
                title: "Вы уверены?",
                text: "Удаление задания",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Да, принять",
                cancelButtonText: "Отмена",
                closeOnConfirm: false },
            function(){
                $http({
                    method: 'post',
                    url: '/user/tasks/delete',
                    data: {
                        task_id: task_id
                    }
                }).success(function(response) {
                    success_callback("Задание удалено!");
                    $scope.my_tasks.forEach((my_task,index,tasks)=> {
                        if (my_task._id == task_id) tasks.splice(index,1);
                    });
                }).error(function(resp) {
                    error_callback(null,resp,"Не удалось удалить задание" )
                });
            });
    };


    $scope.checkTask  = function(task,executer) {
       return task.requests.some(x=>x.executer==executer);
    };

    $scope.loadMyTasks = () => {
        $http({
            method:"get",
            url:"/task/my/customerall"
        }).then(function success(response) {
            $scope.my_tasks = response.data;
            $scope.my_tasks.forEach((task)=> {
               task.deadline = new Date(task.deadline);
            });
        }, function errorCallback(response) {
            error_callback(null,response.data,"Не удалось получить ваши задания");
        });
    };

    $scope.updateForm = [];
    $scope.updateTask = function(ev,id, index) {
        var formData = new FormData(ev.currentTarget);
        formData.append("id",id);
        $http({
            url: '/task/update',
            method: 'post',
            data: formData,
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).then(function successCallback(response)  {
           success_callback("Задание успешно обновлено");
        }, function errorCallback(response) {
            error_callback($scope.updateForm[index],response.data,"Не удалось обновить задание");
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
        if ($("a.active").attr("data-id"))
        {
            owl.trigger('owl.next');
            $("input[name='category_name']").val($("a.active").html().split('(')[0]);
            $("input[name='category_id']").val($("a.active").attr("data-id"));
        }
    });
    $('.prev').click(function() {
        owl.trigger('owl.prev');
    });


});
