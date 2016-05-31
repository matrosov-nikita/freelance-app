
angular.module('app').controller('Chat', function($scope, $http, $rootScope, socket) {
    $scope.notifications=[];
    $rootScope.messages = {};

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
        if (response.type=="notification")
        {
            $scope.addNotification(response.note);
        }
        else {
            $scope.addMessage(response);
        }
    };

    $scope.addMessage = (mes) => {
        console.log(mes);
        if ($scope.messages[mes.task] === undefined) {
            $scope.messages[mes.task] = [];
        }
        $scope.messages[mes.task].unshift({
            id: mes._id,
            author: mes.author,
            date: new Date(mes.datePublish),
            message: mes.text
        });
    };

    $scope.addNotification = (note) => {
        var newNotification = {
            id: note._id,
            task_name: note.task.header,
            date: new Date(note.datePublish),
            text: note.text
        };
        $scope.notifications.push(newNotification);
    };

    $scope.chat.mes = {};
    $scope.init = (author) => {
        socket.on('connect', function () {
            console.log('подключиилсь к веб-сокетам');
            socket.emit('subscribe',author);
            socket.on('chat message', function(msg) {
                $scope.resp(msg);
            });
            socket.on('notific message', function(notific) {
               $scope.resp(notific);
                console.log("notific");
                console.log(notific);
            });
        });
    };
    $scope.add = (event, author, task) => {
        if (event.keyCode == 13 && $scope.chat.mes[task]) {
            var data = {
                    text: $scope.chat.mes[task],
                    task: task
            };
            socket.emit('chat message',data,author);
            $scope.chat.mes[task] = "";
        }
    };



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