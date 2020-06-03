
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
    let fromid = $('#fromid').val();

    console.log(user, datetime, msg);

    $.get("/submitAlarmRequest", {toid: user, fromid: fromid, timeOfSend: datetime, msg: msg}, () => {
        document.getElementById('verdict').innerHTML = 'Submitted';
    });
});
