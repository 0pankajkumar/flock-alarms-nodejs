
    

$('#trigger').click(() => {
    let user = document.getElementById('sltd').innerHTML;
    let datetime = Date.parse($('#datetime').val());
    let msg = $('#msg').val();
    let fromid = document.getElementById('fromid').innerHTML;
    let toid = document.getElementById('toid').innerHTML;
    let token = document.getElementById('token').innerHTML;


    console.log(user, datetime, msg);

    $.get("/submitAlarmRequest", {toid: toid, fromid: fromid, timeOfSend: datetime, msg: msg, token: token}, () => {
        document.getElementById('verdict').innerHTML = 'Submitted for lazy sending';
    });
});

// Instantiating date 5 minutes ahead from now
$(document).ready( function() {

    // Hiding data holding parts
    setTimeout((p) => {
        document.getElementById('data-holders').style.display = 'hidden';
      }, 500);

    var now = new Date();
    var month = (now.getMonth() + 1);               
    var day = now.getDate();
    if (month < 10) 
        month = "0" + month;
    if (day < 10) 
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day + 'T' + now.getHours() + ':' + String(now.getMinutes()+5);
    $('#datetime').val(today);
});
