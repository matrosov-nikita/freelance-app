


angular.module('app').controller('Admin', function($scope, $http) {
    $http({
        method:"get",
        url:"/admin/users"
    }).then(function success(response) {
        $scope.users = response.data;
    }, function errorCallback(response) {

    });

    $http({
        method: "get",
        url: "/admin/tasks"
    }).then(function success(response)  {
       $scope.tasks = response.data;
    }, function errorCallback(response) {

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
        var confirmation = confirm("Вы действительно хотите удалить пользователя?");
        if (confirmation)
        {
            $http({
                method: "post",
                url: "/user/delete",
                data: {id: id}
            }).then(function successCallback(response) {
                var userIndex;
                if (response.data) {
                    $scope.users.forEach((user_info,index)=> {
                            if (user_info.user._id == id) userIndex = index;
                    });
                    if (userIndex>=0) $scope.users.splice(userIndex,1);

                }
            }, function errorCallback(response) {

            });
        }
    };
    $scope.deleteTask = function(task_id) {
        var answer = confirm("Вы действительно хотите удалить задание");
        if (answer) {
            $http({
                url: '/user/tasks/delete',
                method: 'post',
                data: {
                    task_id: task_id
                }
            }).then(function successCallback(response) {
                $scope.tasks.forEach((task,index,tasks)=> {
                    if (task._id == task_id) tasks.splice(index,1);
                });
            }, function errorCallback(response) {
                alert("error");
            });
        }
    };

});
