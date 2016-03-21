

angular.module('app').controller('RequestCtrl', function($scope, $http) {

    var generateSetRequests = function(parent,data)
    {
        parent.req_search = []; parent.req_work = []; parent.req_check = []; parent.req_dispute = [];
        parent.done=[];

        function add_request_el(el)
        {
            var status_actions = {
                "Поиск исполнителей":   parent.req_search,
                "В работе": parent.req_work,
                "Ожидает проверки":  parent.req_check,
                "Арбитраж": parent.req_dispute,
                "Выполнено": parent.done
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

    function GetRequestIndexByTask(container, task) {
        return container.findIndex(elem => elem.task._id == task);
    }

    function RemoveRequest(container,task) {
        container.splice(GetRequestIndexByTask(container,task),1);
    }

    function RemoveOneAuthor(source,request,task) {
        var index = GetRequestIndexByTask(source,task);
        if (index>-1) {
            var current =  source[index].requests;
                    return {
                        "task": source[index].task,
                        "requests": current.splice(current.findIndex(elem => elem._id==request), 1)
                    }
                }
         }

    var ComeRequestToAnotherCollection  = function(source,destination, request,task) {
        destination.push(RemoveOneAuthor(source,request,task));
        RemoveRequest(source, task);
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
                    RemoveOneAuthor($scope.requests.req_search,request,task);
                }
            }).error(function() {
                alert("error");
            });
        }
    };
    $scope.SendComment = () => {
        $("#comment").modal('show');
    };

    $scope.SendDispute = function(request,task_id) {
        $("#dispute").modal('show');
        $("#dispute .yes").click(function(e) {
            $http({
                url: '/dispute/add',
                method: 'post',
                data: {
                    task_id: task_id,
                    message:  $("#dispute .message").val()
                }
            }).then(function successCallback(response) {
                $('#dispute').modal('toggle');

                if (request && response) {
                    ComeRequestToAnotherCollection( $scope.requests.req_work,$scope.requests.req_dispute,request, task_id);
                }
            }, function errorCallback(response) {
                alert("error");
            });
        });
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
                    ComeRequestToAnotherCollection( $scope.requests.req_search,$scope.requests.req_work, request,task);
                }
            }).error(function() {
                alert("error");
            });
        }
    };

    $scope.viewAuthorInfo = (id)=>
    {
        location.href= "/user/" + id;
    };
});
