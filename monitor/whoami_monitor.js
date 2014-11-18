var Firebase = require('firebase');
var https = require('https');

var messages = [
    "Your child is eating well. Well done, but please make sure to attend checking regularly. Come back sooner if food situation changes or child develops high fever.",
    "Your child may not be eating enough food and is at risk of health complications. Please ask your nurse for dietary advice and come back for checking in 1 week.",
    "Your child has signs of severe acute malnutrition and their life is in danger. Please take them to hospital immediately. The treatment will be free of cost."
];

var ref = new Firebase('https://dhoxstamp.firebaseio.com/');
console.log('Initialising connection to Firebase');
ref.child('records').on('child_added', function(snapshot) {
    var data = snapshot.val(), key = snapshot.key();
    if(data.mobile && data.risk && !data.registered) {
        ref.child('registration').push({mobile: data.mobile, risk: data.risk}, function() {
            ref.child('records/' + key).update({registered: true});
            console.log('Registered mobile: ' + data.mobile + ' for case ' + key);
        })
    }
});

ref.child('registration').on('child_added', function(snapshot) {
    var data =snapshot.val(), key = snapshot.key();
    if(!data.sent) {
        var message = messages[data.risk-1];
        sendText(data.mobile, message, function(e) {
            if(e) {
                console.log('Error sending message to ' + data.mobile);
            } else {
                ref.child('registration/' + key).update({message: message, sent: (new Date()).getTime()});
                console.log('Message sent to '+ data.mobile + ': ' + message);
            }
        });
    }
});

function sendText(number, message, onComplete) {
    var request = https.request({
        hostname: "api.esendex.com",
        method: "POST",
        path: "/v1.0/messagedispatcher",
        auth: "sis@morseanalytics.com:NDX2408"
    });

    request.on('error', function(e) {
        onComplete(e);
    });

    request.on('response', function() {
        onComplete(null);
    });

    var xml = '<messages>' +
        '<accountreference>EX0051272</accountreference>' +
        '<message>' +
        '<to>' + number + '</to>' +
        '<body>' + message + '</body>' +
        '</message>' +
        '</messages>';
    request.write(xml);
    request.end();
}
