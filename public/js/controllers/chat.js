

angular.module('app').controller('Chat', function($scope, $http,$rootScope) {
    $scope.notifications=[];


    $scope.getNotifications = () => {
        $http({
            url: '/message/notify/get',
            method: 'get'
        }).then(success = (response)=> {
            response.data.forEach((note)=> {
               $scope.addNotification(note);
            })
        }, error = (resp) => {

        });
    };

    $scope.resp = (response) => {
        if (response.data.type=="notification")
        {
            $scope.addNotification(response.data.note);
            $scope.subscribeByTask(response.data.note.task._id);
        }
        else {
            $scope.addMessage(response.data.task, response.data);
            $scope.subscribeByTask(response.data.task);
        }


    };

    $scope.subscribeCustomersTasks = () => {
        $http({
            url: '/message/subscribe/customer',
            method: 'get'
        }).then(function (response) {
            alert("RESP");
           $scope.resp(response);
        }, function (response) {
        });
    };

    $scope.subscribeExecuterTasks = () => {
        $http({
            url: '/message/subscribe/executer',
            method: 'get'
        }).then(function (response) {
           $scope.resp(response);
        }, function (response) {

        });
    };

    $scope.subscribeByTask = (task)=> {
        $http({
            url: '/message/subscribe/'+task,
            method: 'get'
        }).then(function (response) {
            $scope.resp(response);
        }, function (response) {

        });
    };

    $scope.addMessage = (task,mes) => {
        if ($rootScope.messages[task] === undefined) {
            $rootScope.messages[task] = [];
        }
        $rootScope.messages[task].unshift({
            id: mes._id,
            author: mes.author,
            date: new Date(mes.datePublish),
            message: mes.text
        });
    };

    $scope.addNotification = (note) => {
        $scope.notifications.push({
            id: note._id,
            task_name: note.task.header,
            date: new Date(note.datePublish),
            text: note.text
        });
    };

    $scope.chat.mes = {};
    $scope.add = (event, author, task) => {
        if (event.keyCode == 13) {
            $http({
                url: '/message/add',
                method: 'post',
                data: {
                    text: $scope.chat.mes[task],
                    task: task
                }
            }).then(function successCallback(response) {
                $scope.chat.mes[task] = "";
            }, function errorCallback(response) {

            });
        }
    };
    $rootScope.messages = {};
    $scope.showChat = (ev, task) => {
        $(ev.currentTarget).closest('.request').children('.chat').slideToggle();
        if ($rootScope.messages[task] == undefined) {
            $rootScope.messages[task] = [];
            $http({
                url: '/message/getByTask?task=' + task,
                method: 'get'
            }).then(function success(resp) {
                resp.data.forEach((message) => {
                         $rootScope.messages[task].unshift({
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