const Joi = require('joi');
const mongoose = require('mongoose');

const Customer = mongoose.model('Customer', new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    isGold: {
        type: Boolean,
        default: false
    },
    phone: {
        type: String,
        minlength: 10,
        required: true
    }
}));

function validateCustomer(customer) {
    const schema = {
        name: Joi.string().min(3).max(255).required(),
        isGold: Joi.boolean(),
        phone: Joi.string().min(10).required()
    };
    return Joi.validate(customer, schema);
}

exports.Customer = Customer;
exports.validate = validateCustomer;