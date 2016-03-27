

angular.module('app').controller('Chat', function($scope, $http) {

    $scope.subscribeCustomersTasks = () => {
        $http({
            url: '/message/subscribe/customer',
            method: 'get'
        }).then(function (response) {
           $scope.addMessage(response.data.task,response.data);
           $scope.subscribeByTask(response.data.task);

        }, function (response) {

        });
    };

    $scope.subscribeExecuterTasks = () => {
        $http({
            url: '/message/subscribe/executer',
            method: 'get'
        }).then(function (response) {
            $scope.addMessage(response.data.task,response.data);
            $scope.subscribeByTask(response.data.task);
        }, function (response) {

        });
    };

    $scope.subscribeByTask = (task)=> {
        $http({
            url: '/message/subscribe/'+task,
            method: 'get'
        }).then(function (response) {
            $scope.addMessage(response.data.task,response.data);
            $scope.subscribeByTask(task);
        }, function (response) {

        });
    };

    $scope.addMessage = (task,mes) => {
        if ($scope.messages[task] === undefined) {
            $scope.messages[task] = [];
        }
        $scope.messages[task].unshift({
            id: mes._id,
            author: mes.author,
            date: new Date(mes.datePublish),
            message: mes.text
        });
    };

    $scope.add = (event, author, task) => {
        if (event.keyCode == 13) {
            $http({
                url: '/message/add',
                method: 'post',
                data: {
                    text: $scope.chat.mes,
                    task: task
                }
            }).then(function successCallback(response) {
                $scope.chat.mes = "";
            }, function errorCallback(response) {

            });
        }
    };
    $scope.messages = {};
    $scope.showChat = (ev, task) => {
        $(ev.currentTarget).closest('.request').children('.chat').slideToggle();
        if ($scope.messages[task] == undefined) {
            $scope.messages[task] = [];
            $http({
                url: '/message/getByTask?task=' + task,
                method: 'get'
            }).then(function success(resp) {
                resp.data.forEach((message) => {
                         $scope.messages[task].unshift({
                            id: message.id,
                            author: message.author,
                            date: new Date(message.datePublish),
                            message: message.text
                    });
                })
            }, function error(resp) {

            });
        }
    }
});