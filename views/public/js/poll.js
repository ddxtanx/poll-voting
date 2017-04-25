function createChart(options, element){
    var keys = Object.keys(options);
    var values = [];
    for(var x in keys){
        values[x] = options[keys[x]]
    }
    for(var x = 0; x<keys.length; x++){
        keys[x] = keys[x].replace(/_=/g, "$").replace(/`/g, '.');
    }
    var ctx = $(element);
    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            title: "Votes For Poll!",
            labels: keys,
            datasets: [{
                label: '# of Votes',
                data: values,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
    return chart;
}
$(document).ready(function(){
    $("#dataSubmit").click(function(){
        var name = $("#pollName").val();
        var optionChecked = $("input[name='option']:checked").val();
        if(optionChecked==undefined){
            return false;
        }
        $.ajax("/vote", {
            type:"POST",
            data:{
                name: name,
                selectedOption: optionChecked
            },
            success: function(data){
                $("#poll-data").remove();
                $("#poll").remove();
                data = JSON.parse(data);
                var options = data.options;
                createChart(options, "#vote-chart");
                console.log("vote success "+data);
            },
            error: function(data){
                console.log("vote error "+data);
            }
        });
    });
});