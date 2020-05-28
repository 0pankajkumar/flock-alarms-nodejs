
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
    


