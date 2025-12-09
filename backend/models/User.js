const mongoose = require("mongoose");

const transaccionSchema = new mongoose.Schema({
    tipo: { 
        type: String, 
        enum: ['Deposito', 'Retiro', 'Apuesta_Ruleta'], 
        required: true 
    },
    monto: { 
        type: Number, 
        required: true 
    },
    fecha: { 
        type: Date, 
        default: Date.now 
    },
}, { _id: false }); 

const ruletaHistorialSchema = new mongoose.Schema({
    numGanador: { 
        type: Number, 
        required: true 
    },
    colorGanador: { 
        type: String, 
        enum: ['rojo', 'negro', 'verde'], 
        required: true 
    },
    apuesta: { 
        type: String, 
        required: true 
    },
    apuestaMonto: { 
        type: Number,
        required: true
    },
    cambioNeto: { 
        type: Number,
        required: true 
    },
    fecha: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: { 
        type: String, 
        required: true 
    },
    saldo: { 
        type: Number, 
        default: 1000 
    },
    transacciones: [transaccionSchema],
    historialRuleta: [ruletaHistorialSchema] 
});

module.exports = mongoose.model("User", userSchema);