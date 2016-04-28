
angular.module('app').controller('Dispute', function($scope, $http) {
    $scope.task = null;
    $http({
        method:"get",
        url:"/dispute/getIDs"
    }).then(function success(response) {
        $scope.ids = response.data;
        success_callback("В арбитраже "+Object.keys($scope.ids).length + " заданий");
    }, function errorCallback(response) {
        error_callback(null,response.data,"Не удалось получить задания для арбитража");
    });
    $scope.getMessages = (id) => {
        $http({
            method: "get",
            url: "/message/getByTask?task="+id
        }).then(function sucessCallback(response) {
            $scope.messages = response.data;
        }, function errorCallback(response) {
            error_callback(null,response.data,"Не удалось получить сообщения по заданию");
        })
    };

    $scope.getInfo = (id)=> {
        $http({
            method: "get",
            url: "/dispute/getInfo?id="+id
        }).then(function sucessCallback(response) {
            $scope.task = response.data;
            $scope.getMessages(id);
        }, function errorCallback(response) {
            error_callback(null,response.data,"Не удалось получить инофрмацию по заданию");
        })
    };

    $scope.isEmpty = (obj) => {
        return !$.isEmptyObject(obj);
    };

    $scope.submitComment = (task) => {
        $scope.comment.task = task;
        $http({
            method: "post",
            url: "/dispute/resolve",
            data: $scope.comment
        }).then(function success(resp) {
            success_callback("Процедура арбитража прошла успешно");
            location.href = "/dispute";
        }, function error(resp) {
            error_callback($scope.addComment,resp.data,"Не удалось провести арбтираж");
        });
    }

});
