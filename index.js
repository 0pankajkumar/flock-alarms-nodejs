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

app.get('/getWebpage', (req, res) => {
    var event = null;
    if(req.query.flockEvent){
        JSON.parse(req.query.flockEvent);
    }

    var alarms;
    if(event){
        alarms = store2.userAlarms(event.userId).map(function (alarm) {
            return {
                msg: alarm.msg,
                timeString: new Date(alarm.timeOfSending).toLocaleString(),
                toid: alarm.toid
            }
        });
    }
    else{
        alarms = '';
    }

    res.set('Content-Type', 'text/html');
    var body = Mustache.render(listTemplate, { alarms: alarms });
    res.send(body);
});

app.get('/getContacts', (req, res) => {
    res.set('Content-Type', 'application/json');

    try{
        var getData = helper.getContacts('d980962a-1754-4f52-88b3-3a8ee699f816');        
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


app.get('/submitAlaramRequest', (req, res) => {

   var r = parseDate(req.query.theDate);
    console.log('parse result', r);
    if (r) {
        var alarm = {
            fromid: req.query.fromid,
            toid: req.query.toid,
            timeOfSending: r,
            msg: req.query.msg.slice(r.end).trim()
        };
        console.log('adding alarm', alarm);
        addAlarm(alarm);
        // callback(null, { text: 'Alarm added' });
        res.send('submitted');
    } else {
        // callback(null, { text: 'Alarm time not specified' });
        res.send('submission failed ');
    } 
});

var parseDate = function (text) {
    console.log('Received this for parsing into date', text);
    return new Date(Date.parse(text));  
};

var addAlarm = function (alarm) {
    store2.addAlarm(alarm);
    scheduleAlarm(alarm);
};

var scheduleAlarm = function (alarm) {
    var delay = Math.max(0, alarm.timeOfSending - new Date().getTime());
    setTimeout(function () {
        sendAlarm(alarm);
        store2.removeAlarm(alarm);
    }, delay);
};

// schedule all alarms saved in db
// store.allAlarms().forEach(scheduleAlarm);

var sendAlarm = function (alarm) {
    flock.chat.sendMessage(alarm.fromid, {
        to: alarm.toid,
        text: alarm.msg
    });
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

