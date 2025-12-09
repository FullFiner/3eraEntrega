const User = require('../models/User');


async function procesarTransaccionBase(usuarioId, monto, tipo) {
    const montoNum = Number(monto);
    
    
    if (isNaN(montoNum) || montoNum <= 0) {
        throw new Error('El monto debe ser un número positivo.');
    }

    const usuario = await User.findById(usuarioId);
    if (!usuario) {
        throw new Error('Usuario no encontrado.');
    }

    let nuevoSaldo = usuario.saldo;
    let montoTransaccion = montoNum;

    
    if (tipo === 'Retiro') {
        if (montoNum > usuario.saldo) {
            throw new Error('Fondos insuficientes para retirar.');
        }
        nuevoSaldo -= montoNum;
        montoTransaccion = -montoNum; 
    } else if (tipo === 'Deposito') {
        nuevoSaldo += montoNum;
    }

    
    const nuevaTransaccion = {
        tipo: tipo,
        monto: montoTransaccion,
        fecha: new Date()
    };

    
    usuario.saldo = nuevoSaldo;
    
    
    usuario.transacciones.unshift(nuevaTransaccion); 

    await usuario.save();

    return usuario;
}


exports.depositar = async (req, res) => {
    try {
        const { monto } = req.body;
        const usuarioId = req.cookies.usuario_id;

        if (!usuarioId) return res.status(401).json({ message: 'No autorizado' });

        const usuario = await procesarTransaccionBase(usuarioId, monto, 'Deposito');
        
        res.json({ 
            success: true, 
            nuevoSaldo: usuario.saldo, 
            message: 'Depósito realizado con éxito.' 
        });

    } catch (error) {
        console.error('Error depósito:', error.message);
        res.status(400).json({ message: error.message || 'Error al procesar depósito' });
    }
};


exports.retirar = async (req, res) => {
    try {
        const { monto } = req.body;
        const usuarioId = req.cookies.usuario_id;

        if (!usuarioId) return res.status(401).json({ message: 'No autorizado' });

        const usuario = await procesarTransaccionBase(usuarioId, monto, 'Retiro');
        
        res.json({ 
            success: true, 
            nuevoSaldo: usuario.saldo, 
            message: 'Retiro realizado con éxito.' 
        });

    } catch (error) {
        console.error('Error retiro:', error.message);
        res.status(400).json({ message: error.message || 'Error al procesar retiro' });
    }
};