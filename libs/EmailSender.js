'use strict';
var conf = require('../config/config');
var nodemailer = require('nodemailer');

class EmailSender {

    constructor(reciever) {
        this.reciever = reciever;
        this.transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: conf.get("sender:email"),
                pass: conf.get("sender:password")
            }
        });
        this.options = conf.get("mailOptions");
        this._constructHtml();
    }

    _constructHtml() {
        this.options.html = "<a href='" +conf.get("host") + ":" + conf.get("port") +
            "/user/verify?hash=" + this.reciever + "'>" + "Подтвердите регистрацию</a>";
    }

    send(callback) {
        this.transporter.sendMail(this.options, function(error, info){
            if(error){
                return callback(error);
            }
            console.log('Message sent: ' + info.response);
            callback(null,true);
        });
    }
}

module.exports = EmailSender;