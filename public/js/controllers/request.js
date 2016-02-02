var myApp = angular.module('app', []);
myApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}]);

myApp.controller('RequestCtrl', function($scope, $http) {

    $http.get('/request/getRequests').success(function(data) {
        $scope.req_search = []; $scope.req_work = []; $scope.req_check = []; $scope.req_dispute = [];
        data.forEach(function(el) {

           switch(el.task.status) {
               case  "Поиск исполнителей":
               {
                   $scope.req_search.push(el);
                   break;
               }
               case "В работе" :
               {
                   $scope.req_work.push(el);
                    el.requests.forEach(function(request) {
                        request.date = new Date(el.task.deadline) - new Date();
                    });

                   break;
               }
               case "Ожидает проверки" :
               {
                   $scope.req_check.push(el);
                   break;
               }
               case "Арбитраж":
               {
                   $scope.req_dispute.push(el);
                   break;
               }

           }

        });
    });
    $http.get('/request/getOwnRequests').success(function(data) {
        $scope.own_requests = data;
    });

    function GetRequestIndexByTask(task) {
        return $scope.req_search.findIndex(elem => elem.task._id == task);
    }

    function RemoveRequest(task) {
        $scope.req_search.splice(GetRequestIndexByTask(task),1);
    }

    function RemoveOneAuthor(request,task) {
        var index = GetRequestIndexByTask(task);
        if (index>-1) {
            var current =  $scope.req_search[index].requests;
                    return {
                        "task": $scope.req_search[index].task,
                        "requests": current.splice(current.findIndex(elem => elem._id==request), 1)
                    }
                }
         }

    var ComeRequestToWork = function(request,task) {
        $scope.req_work.push(RemoveOneAuthor(request,task));
        RemoveRequest(task);
    };

    $scope.RefuseRequest = function(request,task) {
        var response = confirm("Вы действительно хотите отклонить данную заявку?");
        if (response) {
            $http({
                method: 'post',
                url: '/request/refuse',
                data: {
                    request: request
                }
            }).success(function(response) {
                if (response) {
                    RemoveOneAuthor(request,task);
                }
            }).error(function() {
                alert("error");
            });
        }
    };

    $scope.AcceptRequest = function(request,task) {
        var response = confirm("Принять заявку?");
        if (response) {
            $http({
                method: 'post',
                url: '/request/accept',
                data: {
                    request: request
                }
            }).success(function(response) {
                if (response) {
                    ComeRequestToWork(request,task);
                }
            }).error(function() {
                alert("error");
            });
        }
    };



});