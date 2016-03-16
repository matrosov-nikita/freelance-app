
angular.module('app').config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}]);

angular.module('app').controller('Dispute', function($scope, $http) {
    $scope.task = null;
    $http({
        method:"get",
        url:"/dispute/getIDs"
    }).then(function success(response) {
        $scope.ids = response.data;
    }, function errorCallback(response) {

    });
    $scope.getMessages = (id) => {
        $http({
            method: "get",
            url: "/message/getByTask?task="+id
        }).then(function sucessCallback(response) {
            $scope.messages = response.data;
            console.log($scope.messages);
        }, function errorCallback(response) {

        })
    }
    $scope.getInfo = (id)=> {
        $http({
            method: "get",
            url: "/dispute/getInfo?id="+id
        }).then(function sucessCallback(response) {

            $scope.task = response.data;
            $scope.getMessages(id);
        }, function errorCallback(response) {

        })
    };

});
