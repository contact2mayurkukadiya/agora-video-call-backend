var http = require('http');
var express = require('express');
var cors = require('cors');
var { RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole } = require('agora-access-token')


// token expire time, hardcode to 3600 seconds = 1 hour
var expirationTimeInSeconds = 3600

var app = express();
app.set('port', process.env.PORT);
app.use(cors())

var generateRtcToken = function (req, resp) {
    var { uid = 0, role = 0, channelName } = req.query
    var currentTimestamp = Math.floor(Date.now() / 1000)
    var privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

    if (role == 1) {
        role = RtcRole.SUBSCRIBER
    } else {
        role = RtcRole.PUBLISHER
    }
    if (!channelName) {
        return resp.status(400).json({ 'error': 'channel name is required' }).send();
    }


    var key = RtcTokenBuilder.buildTokenWithUid(process.env.AGORA_APP_ID, process.env.AGORA_APP_CERTIFICATE, channelName, uid, role, privilegeExpiredTs);

    return resp.json({ 'key': key }).send();
};

var generateRtmToken = function (req, resp) {
    var currentTimestamp = Math.floor(Date.now() / 1000)
    var privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
    var account = req.query.account;
    if (!account) {
        return resp.status(400).json({ 'error': 'account is required' }).send();
    }

    var key = RtmTokenBuilder.buildToken(process.env.AGORA_APP_ID, process.env.AGORA_APP_CERTIFICATE, account, RtmRole, privilegeExpiredTs);

    return resp.json({ 'key': key }).send();
};

app.get('/health', (req, res) => { res.send('OK') })
app.get('/rtcToken', generateRtcToken);
app.get('/rtmToken', generateRtmToken);


http.createServer(app).listen(app.get('port'), function () {
    console.log('AgoraSignServer starts at ' + app.get('port'));
});