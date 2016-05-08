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

    $scope.getReviews = () => {

        $http({
            method: "get",
            url: "/user/reviews?id="+$scope.user._id
        }).then((resp)=> {
            $scope.reviews = resp.data;
            console.log($scope.reviews);
        }, (err) => {
            error_callback(null,err.data,"Не удалось получить отзывы пользователя");
        });
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