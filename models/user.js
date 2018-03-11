var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    data: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Users', usersSchema);