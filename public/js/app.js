var App = angular.module('app', [])
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
                    console.log(oldVal);
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