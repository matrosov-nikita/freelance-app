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
                scope.$watch('messages', function(newVal,oldVal) {

                    if (newVal!==oldVal)
                    {
                        console.log(newVal,oldVal);
                         newVal[attrs.messageList].filter(el => oldVal[attrs.messageList].indexOf(el) === -1).forEach((el)=> {
                            show(el);
                        });
                    }

                },true);
            }
        }
    });