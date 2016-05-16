

angular.module('app').controller('RequestCtrl', function($scope, $http) {

    var generateSetRequests = function(parent,data)
    {
        parent.req_search = []; parent.req_work = []; parent.req_check = []; parent.req_dispute = []; parent.req_complete=[];
        parent.done=[];

        function add_request_el(el)
        {
            var status_actions = {
                "Поиск исполнителей":   parent.req_search,
                "В работе": parent.req_work,
                "Ожидает проверки":  parent.req_check,
                "Арбитраж": parent.req_dispute,
                "Выполнено": parent.req_complete,
            };

            if (el.hasOwnProperty('requests'))
            {
                el.requests.forEach(function(request) {
                    console.log(new Date(el.task.deadline).toLocaleString());
                    console.log(new Date().toLocaleString());
                    console.log(new Date(el.task.deadline) - new Date());
                     request.date =new Date(el.task.deadline) - new Date();
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
        swal({
                title: "Вы уверены?",
                text: "Удаление заявки",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Да, принять",
                closeOnConfirm: false },
            function(){
                $http({
                    method: 'post',
                    url: '/request/refuse',
                    data: {
                        request: request
                    }
                }).success(function(response) {
                    success_callback("Заявка удалена!");
                    if (response) {
                        RemoveOneAuthor($scope.requests.req_search,request,task);
                    }
                }).error(function(resp) {
                    error_callback(null,resp,"Не удалось удалить заявку" )
                });
            });
    };


    $scope.SendComment = () => {
        $("#comment").modal('show');
    };

    $scope.isEmpty = (obj) => {
        return !$.isEmptyObject(obj);
    };

    $scope.AddComment = () => {
        $scope.result.id = $scope.task._id;
        $http({
            method: 'post',
            url: '/task/add/comment',
            data: $scope.result
        }).then(()=> {
            window.location.href = "/request/get";
        }, (resp)=> {
            error_callback($scope.addComment,resp.data,"Не удалось подтвердить результат работы исполнителя");
        });
    };



    $scope.OpenDispute = function(request,task_id) {
        $scope.disputeTask = task_id;
        $scope.disputeRequest = request;
        $("#dispute").modal('show');
    };
    $scope.dispute = {};
    $scope.SendDispute = () => {
        $scope.dispute.task_id = $scope.disputeTask;
            $http({
                url: '/dispute/add',
                method: 'post',
                data:  $scope.dispute
            }).then(function successCallback(response) {
                $('#dispute').modal('toggle');
                if ($scope.disputeRequest && response) {
                    ComeRequestToAnotherCollection( $scope.requests.req_work,$scope.requests.req_dispute,$scope.disputeRequest,  $scope.disputeTask);
                }
            }, function errorCallback(response) {
                error_callback($scope.addDispute,response.data,"Не удалось отправить жалобу");
            });
    };

    $scope.AcceptRequest = function(request,task,ev) {
        ev.stopPropagation();
        swal({
                title: "Вы уверены?",
                text: "Подтверждние заявки",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Да, принять",
                closeOnConfirm: false },
            function(){
                $http({
                    method: 'post',
                    url: '/request/accept',
                    data: {
                        request: request
                    }
                }).success(function(response) {
                    success_callback("Заявка утверждена!");
                    if (response) {
                        ComeRequestToAnotherCollection( $scope.requests.req_search,$scope.requests.req_work, request,task);
                    }

                }).error(function(resp) {
                    error_callback(null,resp,"Не удалось подтвердить заявку" )
                });
            });

    };

    $scope.viewAuthorInfo = (id)=>
    {
        location.href= "/user/" + id;
    };
});
