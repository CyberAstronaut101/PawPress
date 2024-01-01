const mongoose = require('../config/mongoose')

const notifyEmail = mongoose.Schema({
    // email: { type: String, unique: true, required: true },
    email: { type: String, required: true },
    product: { type: String, required: true },
    date_added: { type: Date, default: Date.now },
})

notifyEmail.statics.emailOnDistributionList = async function (email) {
    const user = await this.findOne({ email })
    return !!user
}

const NotifyEmail = mongoose.model('NotifyEmail', notifyEmail)

module.exports = NotifyEmail
