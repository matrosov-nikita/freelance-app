var App = angular.module('app',[])
    .directive("messageList", function() {
        return {
            link: function(scope,element,attrs) {
                var show = (message) => {
                    var mes = document.createElement("div");
                    mes.innerHTML = message.message;
                    mes.className="mes";
                    var author = document.createElement("a");
                    author.innerHTML = message.author.name;
                    author.href="/user/"+message.author._id;
                    var date = document.createElement("span");
                    date.innerHTML = message.date.toLocaleString();
                    mes.appendChild(document.createElement("br"));
                    mes.appendChild(author); mes.appendChild(date);
                    $(element[0]).prepend(mes);
                };
                var uniqueResultOne =(newVal,oldVal)=> {
                    return newVal.filter(function(obj) {
                        return !oldVal.some(function(obj2) {
                            return obj.id == obj2.id;
                        });
                    });
                };
                scope.$watch('messages', function(newVal,oldVal) {
                    if (newVal!==oldVal)
                    {

                        uniqueResultOne(newVal[attrs.messageList],oldVal[attrs.messageList]).forEach((mes)=> {
                            show(mes);
                        });
                    }

                },true);
            }
        }
    })
    .directive('notificationList', function() {
    return {
        link: function (scope, element, attrs) {
            var show = (notification)=> {
              var notify = document.createElement('div'); notify.className='notify';
                var task = document.createElement("span");
                task.className = "task";
                task.innerHTML = notification.task_name;
                var text = document.createElement("p");
                text.innerHTML = notification.text;
                var date = document.createElement("span");
                date.className = "date";
                date.innerHTML = notification.date.toLocaleString();
                notify.appendChild(task); notify.appendChild(text); notify.appendChild(date);
                $(element[0]).prepend(notify);

            };

            var uniqueResultOne =(newVal,oldVal)=> {
                return newVal.filter(function(obj) {
                    return !oldVal.some(function(obj2) {
                        return obj.id == obj2.id;
                    });
                });
            };
            scope.$watch('notifications', function(newVal, oldVal) {
                    uniqueResultOne(newVal,oldVal).forEach((note)=> {
                        show(note);
                    });
            },true)
        }
    }
})
    .directive('drawing',function($http) {
        return  {
            restrict: "EA",
            link: function (scope,element,attrs)
            {
                var show = (data) => {
                    while (element[0].hasChildNodes()) {
                        element[0].removeChild(element[0].lastChild);
                    }
                    var canvas = document.createElement('canvas');
                    element[0].appendChild(canvas);
                    Chart.defaults.global.legend = false;
                    new Chart(canvas.getContext('2d'), {
                        type: 'line',
                        data: data
                    });
                };

                var params="";
                if (scope.user) params = "?id="+scope.user._id;
                $http({
                    method:'get',
                    url: attrs.url + params
                }).then(successCallback = (resp) => {
                    scope.pureDate = resp.data;
                    scope.getFormatChartData("month",scope.pureDate);
                    //show(scope.tasksPerDate);
                }, errorCallback = (resp)=> {
                    error_callback(null,resp.data,"Не удалось полуить статистику");
                });


               scope.$watch('tasksPerDate', function(newVal, oldVal) {
                   if (newVal!==oldVal)
                   {
                       show(newVal);
                   }
                },false)
            }
        }
    });

App.filter('orders', function() {
    return function(items,field, greaterThan, lowerThan) {
        items = items.filter(function(item){
            return item[field] >= greaterThan && item[field] <= lowerThan;
        });
        return items;
    }
});

App.filter('requests', function() {
    return function(items,field, greaterThan, lowerThan) {
        items = items.filter(function(item){
            return item[field].length >= greaterThan && item[field].length <= lowerThan;
        });
        return items;
    }
});
App.filter('timespan', function () {
   return function(diff) {
        if (diff>0)
        {
            var days = Math.floor(diff / (1000 * 60 * 60 * 24));
            diff -=  days * (1000 * 60 * 60 * 24);

            var hours = Math.floor(diff / (1000 * 60 * 60));
            diff -= hours * (1000 * 60 * 60);

            var mins = Math.floor(diff / (1000 * 60));
            diff -= mins * (1000 * 60);

            var seconds = Math.floor(diff / (1000));
            diff -= seconds * (1000);
            return days + " дн. " + hours + " ч. " + mins + " мин. " + seconds + " сек."
        }
        return "Срок истек!";

   }
});
App.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}]);