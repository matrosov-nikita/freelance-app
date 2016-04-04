angular.module('app').controller('PortfolioCtrl', function($scope, $http) {

    $scope.submitUser = ()=> {
        $http({
            method:"post",
            url: "/user/update",
            data: $scope.user
        }).then(success = (resp)=> {

        }, error = (resp)=> {

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

        }, error = ()=> {

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