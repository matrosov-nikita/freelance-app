var myApp = angular.module('app', []);
myApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}]);

myApp.controller('RequestCtrl', function($scope, $http) {

    var generateSetRequests = function(parent,data)
    {
        parent.req_search = []; parent.req_work = []; parent.req_check = []; parent.req_dispute = [];

        function add_request_el(el)
        {
            var status_actions = {
                "Поиск исполнителей":   parent.req_search,
                "В работе": parent.req_work,
                "Ожидает проверки":  parent.req_check,
                "Арбитраж": parent.req_dispute
            };

            if (el.hasOwnProperty('requests'))
            {
                el.requests.forEach(function(request) {
                     request.date =new Date(el.task.deadline) - new Date()?new Date(el.task.deadline) - new Date():"Срок истек";
                });
            }
            status_actions[el.task.status].push(el);
        }


        data.forEach(function(el) {
            add_request_el(el);
        });
    };

    $http.get('/request/getRequests').success(function(data) {
        $scope.requests = {};
        generateSetRequests($scope.requests, data);
    });
    $http.get('/request/getOwnRequests').success(function(data) {
        $scope.own_requests = {};
        generateSetRequests($scope.own_requests, data);
    });

    function GetRequestIndexByTask(task) {
        return $scope.requests.req_search.findIndex(elem => elem.task._id == task);
    }

    function RemoveRequest(task) {
        $scope.requests.req_search.splice(GetRequestIndexByTask(task),1);
    }

    function RemoveOneAuthor(request,task) {
        var index = GetRequestIndexByTask(task);
        if (index>-1) {
            var current =  $scope.requests.req_search[index].requests;
                    return {
                        "task": $scope.requests.req_search[index].task,
                        "requests": current.splice(current.findIndex(elem => elem._id==request), 1)
                    }
                }
         }

    var ComeRequestToWork = function(request,task) {
        $scope.requests.req_work.push(RemoveOneAuthor(request,task));
        RemoveRequest(task);
    };

    $scope.RefuseRequest = function(request,task,ev) {
        ev.stopPropagation();
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

    $scope.AcceptRequest = function(request,task,ev) {
        ev.stopPropagation();
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
    $scope.viewAuthorInfo = (id)=>
    {
        location.href= "/user/" + id;
    }



});