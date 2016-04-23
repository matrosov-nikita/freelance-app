angular.module("app").controller('PortfolioCtrl', function($scope, $http) {

    $scope.submitUser = ()=> {
        $http({
            method:"post",
            url: "/user/update",
            data: $scope.user
        }).then(success = (resp)=> {
            success_callback("Информация о пользователе обновлена");
        }, error = (resp)=> {
            error_callback($scope.updateForm.user,resp.data,'Ошибка обновления');
        });
    };

    $scope.isEmpty = (obj) => {
        return !$.isEmptyObject(obj);
    };

    $scope.fillCalendarDate = (data) => {
        var d = new Date();
        var dates = [];
        var dataset ={
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: []
        };
       d.setDate(d.getDate()-31);
       for(var i = new Date(d); i<= new Date(); i.setDate(i.getDate()+1))
       {
          (i.toDateString() in data)?dataset.data.push(data[i.toDateString()]):dataset.data.push(0);
          dates.push(new Date(i).toDateString());
       }
        var datasets = []; datasets.push(dataset);
        return {
            labels: dates,
            datasets: datasets
        }
    };

    $scope.submitWork = () => {
        $http({
            method: "post",
            url: "/user/upload",
            data: new FormData($("#upload")[0]),
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).then(success=(resp)=> {
            $scope.works.push(resp.data);
            success_callback("Работа в портфолио успешно добавлено");
        }, error = (resp)=> {
            error_callback($scope.addWork,resp.data,'Не удалось добавить работу в портфолио');
        })
    }
});

$(document).ready(function() {
    $("#addwork").click(function() {
        $("#upload").slideToggle();
    });

    if (!access) {
        $("input,textarea,button").prop("disabled", true);
        $(".modal button").prop("disabled", false);
    }
});