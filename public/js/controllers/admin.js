
angular.module('app').config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}]);

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
    }

});
