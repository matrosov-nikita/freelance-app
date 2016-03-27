angular.module('app').controller('NotifyCtrl', function($scope) {

    $scope.notifications={};

$scope.notifications =
{
    1234: {
        task_name: 'Тестовое задание',
        date: new Date(),
        text: "Ваше задание опубликовано. Ждите заявок"
    },
    3456: {
        task_name: 'Тестовое задание2',
        date: new Date(),
        text: "Задание переведено в работу"
    }
}
});