
angular.module('app').config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}]);

angular.module('app').controller('Chat', function($scope, $http, $interval) {

    $scope.subscribe = () => {
        $http({
            url: '/message/subscribe',
            method: 'post'
        }).then(function (response) {

        }, function (response) {

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
                if ($scope.messages[task] === undefined) {
                    $scope.messages[task] = [];
                }
                $scope.messages[task].unshift({
                    author: author,
                    date: new Date(),
                    message: $scope.chat.mes
                });
                $scope.chat.mes = "";
            }, function errorCallback(response) {

            });
        }
    };
    $scope.messages = {};
    $scope.showChat = (ev, task) => {
        console.log(typeof  task);
        $(ev.currentTarget.parentElement.parentElement.nextElementSibling.nextElementSibling).slideToggle();
        if ($scope.messages[task] == undefined) {
            $scope.messages[task] = [];
            $http({
                url: '/message/getByTask?task=' + task,
                method: 'get'
            }).then(function success(resp) {
                resp.data.forEach((message) => {
                    setTimeout(function() {
                         $scope.messages[task].unshift({
                            author: message.author,
                            date: new Date(message.datePublish),
                            message: message.text
                    });
                    }, 0);
                })
            }, function error(resp) {

            });
        }
    }
});