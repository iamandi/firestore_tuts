const mongoose = require('mongoose');

const id = new mongoose.Types.ObjectId;
console.log('id', id);
console.log('timestamp', id.getTimestamp());
console.log('isValid', mongoose.Types.ObjectId.isValid(id));