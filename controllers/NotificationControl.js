var nodemailer = require('nodemailer');

/*
createAppointment
cancleAppointment
updateAppointment

*/
module.exports.sendEmail = function(dest,detail,type,callback){

  var smtpTrans = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'iDocAppointment@gmail.com',
        pass: 'mmasanta'
    }
  });

  smtpTrans.sendMail({
        "from": "AUTOMAILERIDOC@gmail.com", 
          "to": dest,
          "subject": "แจ้งแตือนประเภท : " +type ,
          "text": 'แจ้งเตือน \nการนัดหมายมีการเคลื่อนไหว ประเภท '+ type + '\n ข้อมูลดังนี้ \n\n\n' +detail
  });

  callback(null,"SUCCESS");
}