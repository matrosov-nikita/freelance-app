angular.module('app').controller('StatsCtrl', function($scope) {

    function getNumberOfDaysInMonth(year, month) {
        var isLeap = ((year % 4) == 0 && ((year % 100) != 0 || (year % 400) == 0));
        return [31, (isLeap ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    }

    function setPreviousDate(days)
    {
        var d = new Date();
        d.setDate(d.getDate()-days);
        return d;
    }

    var DateFilter = {
        month: getNumberOfDaysInMonth(new Date().getFullYear(),new Date().getMonth()),
        yesterday: 1,
        today: 0,
        week: 7
    };

    $scope.startDate = setPreviousDate(DateFilter.month);
    $scope.endDate = new Date();

    $scope.change = () => {
        console.log($scope.startDate);
        console.log($scope.endDate);
        $scope.tasksPerDate = fillCalendarDate($scope.startDate, $scope.endDate, $scope.pureDate);
    };

    function fillCalendarDate(startDate, endDate, data) {
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
        for(var i = new Date(startDate); i<= new Date(endDate); i.setDate(i.getDate()+1))
        {
            (i.toDateString() in data)?dataset.data.push(data[i.toDateString()]):dataset.data.push(0);
            dates.push(new Date(i).toDateString());
        }
        var datasets = []; datasets.push(dataset);
        return {
            labels: dates,
            datasets: datasets
        }
    }

    $scope.getFormatChartData = (period,data) => {
        var startDate = new Date(setPreviousDate(DateFilter[period]));
        var endDate = new Date();
        $scope.tasksPerDate = fillCalendarDate(startDate, endDate, data);
    };


});