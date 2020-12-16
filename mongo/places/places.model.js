const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    account: { type: Schema.Types.ObjectId, ref: 'Account' },
    title: { type: String, required: true },
    place: { type: String, required: true },
    street: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
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
        // remove these props when object is serialized
        delete ret._id;
        delete ret.id;
        delete ret.account;
    }
});

module.exports = mongoose.model('Places', schema);