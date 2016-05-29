


angular.module('app').controller('Admin', function($scope, $http) {
    $http({
        method:"get",
        url:"/admin/users"
    }).then(function success(response) {
        $scope.users = response.data;
    }, function errorCallback(response) {
        error_callback(null,response.data,"Не удалось получить пользователей");
    });

    $http({
        method: "get",
        url: "/admin/tasks"
    }).then(function success(response)  {
       $scope.tasks = response.data;
    }, function errorCallback(response) {
        error_callback(null,response.data,"Не удалось получить задания");
    });

    $scope.search = {
        user: {
            customerComparer: {
                min: 0,
                max: 10000
            },
            executerComparer: {
                min: 0,
                max: 10000
            }
        },
        task: {
            requests: {
                min: 0,
                max: 1000
            }
        }
    };
    $scope.deleteUser = (id)=> {
        swal({
                title: "Вы уверены?",
                text: "Удаление пользователя",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Да, принять",
                cancelButtonText: "Отмена",
                closeOnConfirm: false },
            function(){
                $http({
                    method: "post",
                    url: "/user/delete",
                    data: {id: id}
                }).then(function successCallback(response) {
                    success_callback("Пользователь успешно удален");
                    var userIndex;
                    if (response.data) {
                        $scope.users.forEach((user_info,index)=> {
                            if (user_info.user._id == id) userIndex = index;
                        });
                        if (userIndex>=0) $scope.users.splice(userIndex,1);
                    }
                }, function errorCallback(response) {
                    error_callback(null,response.data,"Не удалось удалить пользователя");
                });
            });
    };

    $scope.deleteTask = function(task_id) {
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
                    url: '/user/tasks/delete',
                    method: 'post',
                    data: {
                        task_id: task_id
                    }
                }).then(function successCallback(response) {
                    success_callback("Задание успешно удалено!");
                    $scope.tasks.forEach((task,index,tasks)=> {
                        if (task._id == task_id) tasks.splice(index,1);
                    });
                }, function errorCallback(response) {
                    error_callback(null,response.data,"Не удалось удалить задание");
                });
            });
    };


    $scope.viewTask = function(task_id) {
        $("#"+task_id).modal('show');
    };

    $scope.colors = {
        "Поиск исполнителей": 'gray',
        "В работе": '#2767B0',
        "Ожидает проверки": '#B0AC27',
        "Арбитраж": '#F14144',
        "Выполнено": '#2C961D'
    }
});
