const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (name, email) => {
    sgMail.send({
        to: email,
        from: 'mateusgoncalvespereira@gmail.com',
        subject: 'Thank you to joining in',
        text: `Welcome to the app ${name}. Let me know how you get along with the application.`
    })

}

const sendByeEmail = (name, email) => {
    sgMail.send({
        to: email,
        from: 'mateusgoncalvespereira@gmail.com',
        subject: 'We miss you already',
        text: `Goodbye ${name}, it's sad see you gone. If we could've done anything different to keep you around, please let us know. See you!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendByeEmail
}