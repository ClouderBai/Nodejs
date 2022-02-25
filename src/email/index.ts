import { createConnection } from 'typeorm';
import nodemailer from 'nodemailer'


export const main = async() => {

    try {
        // const connection = await createConnection({
        //     type: 'postgres',
        //     schema: 'cmd_owner',
        //     database: 'cmds',
        //     host: '127.0.0.1',
        //     port: 5432,
        //     username: 'postgres',
        //     password: 'Win2008',
        //     ssl: false,
        // })
    
        // const result = await connection.query(`
        //     CALL cmd_owner.p_hcm_open_person('V_INPUT_SUCCESS');
        // `)
    
        // console.log('----------result-------------', result)

        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        const transporter = nodemailer.createTransport({
            host: 'smtp.office365.com',
            port: 587,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: ''
            }
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: 'AMCH05993@elililly.onmicrosoft.com', // sender address
            to: "wkh_bai@163.com", // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        
    } catch (err) {
        console.log('----------err-------------', err)
    }
}