// var stocksData = [
//         {
//             "company_name": "Facebook",
//             "code": "fb",
//         },
//         {
//             "company_name": "Google",
//             "code": "goog",
//         },
//         {
//             "company_name": "Yahoo",
//             "code": "yhoo",
//         },
//         {
//             "company_name": "Apple",
//             "code": "aapl",
//         },
//         {
//             "company_name": "Royal Mail",
//             "code": "rmg.l",
//         },
//      ];

var contactsData = () => {
    var rawData;

    return new Promise((accept, reject) => {
        $.get("/getContacts", function(data, status){
            console.log(`We received ${data.length} with ${status} but`);
            accept(JSON.parse(data));
          }).catch(error => {
              console.log(error);
              reject(error);
        });
    });

    // let rawData = fetch('/getContacts');
    //.then(response => response.json());

    // return rawData;
}

console.log("Length of data array ", contactsData.length);
    
var contacts = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: contactsData
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
