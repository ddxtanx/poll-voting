$(document).ready(function(){
    var num = 3;
    $("#add-option").click(function(){
        console.log("num");
       $("#options").append("<br/> <input type='text' name='option["+(num-1)+"]' placeholder='Option "+num+"'/>");
       num++;
    });
});