$(document).ready(function(){
    var num = 3;
    $("#add-option").click(function(){
        console.log("num");
       $("#options").append("<br/> <input type='text' name='option["+(num-1)+"]' placeholder='Option "+num+"'/>");
       num++;
    });
    var chart;
    $(".poll-delete").click(function(){
        var pollName = $(this).attr("for-poll");
        console.log("Deleting: "+pollName);
        $.ajax("/delete", {
            type:"POST",
            data:{
                pollName: pollName
            }, 
            success: function(data){
                console.log(data);
                $(".poll-delete[for-poll='"+pollName+"']").hide('fast', function(){
                    $("tr[for-poll='"+pollName+"']").remove();
                })
            },
            error: function(data){
                console.log("Error: "+JSON.parse(data));
            }
        });
    });
    $(".myPoll").click(function(){
        var pollName = $(this).attr("for-poll");
        $.ajax("/getPollData", {
            type: "POST",
            data:{
                pollName: pollName
            },
            success: function(data){
                data = data[0]
                if(typeof(chart)=="object"){
                    chart.destroy();
                }
                $("iframe").remove();
                $("#vote-chart").html("");
                var options = data.options;
                $("#poll-data").show('fast');
                chart = createChart(options, "#vote-chart");
            },
            error: function(data){
                
            }
        })
    })
});