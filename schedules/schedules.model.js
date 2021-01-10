const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    account: { type: Schema.Types.ObjectId, ref: 'Account' },
    type: { type: String, required: true },
    title: { type: String, required: true },
    schedule: { type: String, required: true },
    verified: Date,
    created: { type: Date, default: Date.now },
    updated: Date
});

schema.virtual('isVerified').get(function () {
    return !!(this.verified);
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remova esses adereços quando o objeto for serializado
        delete ret._id;
    }
});

module.exports = mongoose.model('Schedules', schema);