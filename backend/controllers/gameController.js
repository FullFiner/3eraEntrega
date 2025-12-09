const User = require('../models/User');

exports.spinRoulette = async (req, res) => {
    try {
       
        const userId = req.cookies.usuario_id;
        
        if (!userId) {
            return res.status(401).json({ message: 'No estás logueado' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        
        const { currentBet, apuestaMonto } = req.body;
        const monto = Number(apuestaMonto);

        if (!currentBet || !monto || monto <= 0) {
            return res.status(400).json({ message: 'Datos de apuesta inválidos' });
        }

        if (user.saldo < monto) {
            return res.status(400).json({ message: 'Saldo insuficiente' });
        }

        
        const numbers = [
            0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
            24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
        ];
        const redSet = new Set([
            1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
        ]);

        const numGanador = numbers[Math.floor(Math.random() * numbers.length)];
        const colorGanador = numGanador === 0 ? 'verde' : redSet.has(numGanador) ? 'rojo' : 'negro';

        let ganancia = 0;
        let descApuesta = '';

        
        if (!isNaN(Number(currentBet))) {
            
            const nSel = Number(currentBet);
            descApuesta = `Número ${nSel}`;
            if (nSel === numGanador) ganancia = monto * 36; 
        } else if (currentBet === 'rojo' || currentBet === 'red') { 
            descApuesta = 'Rojo';
            if (colorGanador === 'rojo') ganancia = monto * 2;
        } else if (currentBet === 'negro' || currentBet === 'black') {
            descApuesta = 'Negro';
            if (colorGanador === 'negro') ganancia = monto * 2;
        }

        const cambioNeto = ganancia - monto;
        
        user.saldo += cambioNeto;

        user.historialRuleta.push({
            numGanador,
            colorGanador,
            apuesta: descApuesta,
            apuestaMonto: monto,
            cambioNeto,
            fecha: new Date()
        });

       
        user.transacciones.push({
            tipo: 'Apuesta_Ruleta',
            monto: cambioNeto,
            fecha: new Date()
        });

        /////////////////////////////////////////////////////////////´´´´´´´´´´´´´´
        user.transacciones.unshift({
            tipo: 'Apuesta_Ruleta',
            monto: cambioNeto, // Si perdiste, será negativo. Si ganaste, positivo.
            fecha: new Date()
        });
        ///////////////////////////////////////////////////////////////////

        await user.save(); 

        
        return res.json({
            success: true,
            numGanador,
            colorGanador,
            ganancia,         
            nuevoSaldo: user.saldo,
            historial: user.historialRuleta.slice(-5).reverse() 
        });

    } catch (err) {
        console.error('Error en ruleta:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};