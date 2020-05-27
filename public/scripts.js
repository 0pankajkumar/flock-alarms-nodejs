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

var stocksData = () => {
    fetch('/getContacts')
    .then(response => response.json());
}

console.log("Length of data array ", stocksData.length);
    
var stocks = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('company_name'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: stocksData
    });

    stocks.initialize();

    $('.typeahead').typeahead(
        null, {
        name: 'stocks',
        displayKey: 'company_name',
        source: stocks.ttAdapter()
    }).on('typeahead:selected', function(event, data){            
        $('.typeahead').val(data.code); 
        console.log(data);
        document.getElementById('sltd').innerHTML = data.code;
    });
