var myApp = angular.module('app', []);
myApp.controller('RequestCtrl', function($scope, $http) {

    $http.get('/request/getRequests').success(function(data) {
        $scope.req_search = $scope.req_work = $scope.req_dispute = [];
        data.forEach(function(el) {
           switch(el.task.status) {
               case  "Поиск исполнителей":
                   $scope.req_search.push(el);
                   break;
               case "В работе" :
                   $scope.req_work.push(el);
                   break;
               case "Арбитраж": $scope.req_dispute.push(el);
           }
        });
    });
    $http.get('/request/getOwnRequests').success(function(data) {
        $scope.own_requests = data;
    });

    var removeRequest  = function(request,task) {
        $scope.req_search.forEach(function(item) {
            if (item.task._id === task) {
                item.requests.forEach(function(author,index,array) {
                    if (author._id === request) {
                        return array.splice(index,1);
                    }
                });
            }
        });
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
                    removeRequest(request,task);
                }
            }).error(function() {
                alert("error");
            });
        }
    };

    $scope.AcceptRequest = function(request,task) {
        var response = confirm("Принять заявку");
        if (response) {
            $http({
                method: 'post',
                url: '/request/accept',
                data: {
                    request: request
                }
            }).success(function(response) {
                if (response) {
                    $scope.req_work.push(removeRequest(request,task));
                }
            }).error(function() {
                alert("error");
            });
        }
    };

});