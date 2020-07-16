var config = require('./config.js');
var flock = require('flockos');
var express = require('express');
var store = require('./store.js');
var store2 = require('./store2.js');
var chrono = require('chrono-node');
var Mustache = require('mustache');
var fs = require('fs');
var util = require('util');
var helper = require('./helper');
var cors = require('cors')
var axios = require('axios');


flock.appId = config.appId || process.env.appId;
flock.appSecret = config.appSecret || process.env.appSecret;

var app = express();
app.use(cors())
// var router = express.Router();

var cors = require('cors');
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(flock.events.tokenVerifier);
app.post('/events', flock.events.listener);

app.use(express.static('public'));

app.get('/', (req, res) => {

    console.log('Couldnt get into comma, thanks cronster!');
    res.set('Content-Type', 'text/html');
    var body = '<div><h4>Thanks !</h4><p>for waking me up</p></div>';
    res.send(body);

});

async function myfuhn(userId){
    return await store2.getToken(userId);
}

app.get('/getWebpage', (req, res) => {
    var event = JSON.parse(req.query.flockEvent);
    var fromid = null;
    // if(req.query.flockEvent){
    //     event = JSON.parse(req.query.flockEvent);
    // }

    console.log('the events object',event);

    // let test = myfuhn(event.userId);
    // console.log(test);

    store2.getToken(event.userId)
    .then(store2.getScheduledMessages(event.userId))
    .then((splmsg) => {
        console.log("My splmsg is ", splmsg);
        res.set('Content-Type', 'text/html');
        var body = Mustache.render(listTemplate, { alarms:'', toid: event.chat, fromid: event.userId, token:token, chatName: event.chatName });
        res.send(body);
    });

    // let token = await store2.getToken(event.userId);
    // let pk = 2;
    // console.log(myfuhn(event.userId));
    // res.send("Under Maintenence");








    // var alarms;
    // try{
    //     alarms = store2.userAlarms(event.userId).map(function (alarm) {
    //         return {
    //             msg: alarm.msg,
    //             timeString: new Date(alarm.timeOfSending).toLocaleString(),
    //             toid: alarm.toid,
    //             fromid: event.userId
    //         }
    //     });
    // }
    // catch(e){
    //     alarms = {fromid: event.userId};
    // }

    // res.set('Content-Type', 'text/html');
    // var body = Mustache.render(listTemplate, { alarms: alarms, fromid: event.userId });
    // res.send(body);
});

app.get('/getContacts', (req, res) => {
    res.set('Content-Type', 'application/json');

    try{
        var getData = helper.getContacts('c863e11b-d1bf-4ce0-afb9-b29e847f6152');        
        getData.then(d => {
            console.log('The length of records is ', d.length);
            res.send(JSON.stringify(d))});
    }
    catch(e){
        res.send('some error occured :(');
    }
});


app.listen(process.env.PORT || 8080, function () {
    console.log('Listening on 8080');
});

flock.events.on('app.install', function (event, callback) {
    store2.saveToken(event.userId, event.token);
    console.log('Inserted user probably');
    callback();
});

flock.events.on('app.uninstall', function (event, callback) {
    store2.deleteToken(event.userId, event.token);
    console.log('deleted user probably');
    callback();
});


app.get('/submitAlarmRequest', (req, res, callback) => {

   var r = parseDate(req.query.timeOfSend);
    console.log('Seeing all repsonse queries', req.query);
    console.log('parse result', r);

    store2.getToken(req.query.fromid)
    .then((token) => {
        if (r) {
            var alarm = {
                fromid: req.query.fromid,
                toid: req.query.toid,
                timeOfSending: r,
                msg: req.query.msg.slice(r.end).trim(),
                token: token
            };
            console.log('adding alarm', alarm);
            addAlarm(alarm);
            // callback(null, { text: 'Sending in the future' });
            res.send('submitted');
        }
    });
    






    // store2.getToken(req.query.fromid)
    // .then((token) => {
    //     if (r) {
    //         var alarm = {
    //             fromid: req.query.fromid,
    //             toid: req.query.toid,
    //             timeOfSending: r,
    //             msg: req.query.msg.slice(r.end).trim(),
    //             token: token
    //         };
    //         console.log('adding alarm', alarm);
    //         addAlarm(alarm);
    //         // callback(null, { text: 'Alarm added' });
    //         res.send('submitted');
    //     } else {
    //         // callback(null, { text: 'Alarm time not specified' });
    //         res.send('submission failed ');
    //     }

    // });
     
});

var parseDate = function (text) {
    console.log('Received this for parsing into date', text);
    let d = new Date(0);
    return d.setUTCSeconds(text) / 1000;
    // return new Date(Date.parse(text));  
};

var addAlarm = function (alarm) {
    // let idx = store2.addAlarm(alarm); // idx is the Row number of added record in db
    // console.log('in addAlarm we received', idx);
    // scheduleAlarm(alarm, idx);

    // idx is the Row number of added record in db
    store2.addAlarm(alarm).then((res) => {
        console.log('in addAlarm we received', res);
        scheduleAlarm(alarm, res);
    }, (err) => console.log(err));
};

var scheduleAlarm = function (alarm, idx) {
    console.log('Scheduling alarm task with', idx);
    console.log('Time difference is like this', alarm.timeOfSending,' minus ', new Date().getTime(), alarm.timeOfSending - new Date().getTime());
    var delay = Math.max(0, alarm.timeOfSending - new Date().getTime());
    setTimeout(function () {
        sendAlarm(alarm);
        store2.removeAlarm(alarm, idx);
    }, delay);
};

// schedule all alarms saved in db
// store.allAlarms().forEach(scheduleAlarm);

var sendAlarm = function (alarm) {
    console.log('prepping for sendig message with', alarm);

    axios.get('https://api.flock.co/v1/chat.sendMessage', {
        params: {
          to : alarm.toid,
          text: alarm.msg,
          token: alarm.token
        }
      })
    .then(function (response) {
        console.log('Done sending probably');
      })
      .catch(function (error) {
        console.log('Sending failed mostly');
      })
      .then(function () {
        // always executed
        console.log('We tried sending');
      });  


    // flock.chat.sendMessage(alarm.fromid, {
    //     to: alarm.toid,
    //     text: alarm.msg
    // });
};

var listTemplate = fs.readFileSync('list.mustache.html', 'utf8');
app.get('/list', function (req, res) {
    var event = JSON.parse(req.query.flockEvent);
    var alarms = store.userAlarms(event.userId).map(function (alarm) {
        return {
            text: alarm.text,
            timeString: new Date(alarm.time).toLocaleString()
        }
    });

    var currentToken = store.getToken(event.userId);
    console.log("Current token is ",currentToken);


    res.set('Content-Type', 'text/html');
    var body = Mustache.render(listTemplate, { alarms: alarms });
    res.send(body);
});

