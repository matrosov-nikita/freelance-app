angular.module('app').controller('StatsCtrl', function($scope) {

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
});