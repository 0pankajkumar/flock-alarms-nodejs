
var contacts = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: '/getContacts'
});

contacts.initialize();

$('.typeahead').typeahead(
    null, {
    name: 'stocks',
    displayKey: 'name',
    source: contacts.ttAdapter()
}).on('typeahead:selected', function(event, data){            
    $('.typeahead').val(data.code); 
    console.log(data);
    document.getElementById('sltd').innerHTML = data.id;
});
    

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
