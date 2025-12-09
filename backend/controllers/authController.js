const User = require('../models/User');
const bcrypt = require('bcrypt');

// === REGISTRO ===
exports.register = async (req, res) => {
    const { username, password, email } = req.body;

    try {
       
        const existeUsuario = await User.findOne({ username });
        if (existeUsuario) {
            return res.status(400).json({ message: 'El nombre de usuario ya existe' });
        }

        const existeEmail = await User.findOne({ email });
        if (existeEmail) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

       
        const hashedPass = await bcrypt.hash(password, 10);

       
        const nuevoUsuario = new User({ 
            username, 
            password: hashedPass, 
            email 
        });
        
        await nuevoUsuario.save();

        res.status(201).json({ success: true, message: 'Usuario registrado correctamente' });

    } catch (err) {
        console.error('Error registro:', err);
        res.status(500).json({ message: 'Error interno al registrar usuario' });
    }
};

// === LOGIN ===
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const usuario = await User.findOne({ username });
        if (!usuario) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

       
        res.cookie('usuario_id', usuario._id.toString(), { 
            httpOnly: true, 
            secure: false, 
            maxAge: 24 * 60 * 60 * 1000 
        });
        
        
        res.cookie('username', usuario.username, { 
            httpOnly: false,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({ success: true, message: 'Login exitoso', user: { username: usuario.username } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error interno al iniciar sesión' });
    }
};

// === LOGOUT ===
exports.logout = (req, res) => {
    res.clearCookie('usuario_id');
    res.clearCookie('username');
    res.json({ success: true, message: 'Sesión cerrada' });
};


exports.getProfile = async (req, res) => {
    try {
        
        const userId = req.cookies.usuario_id;
        if(!userId) return res.status(401).json({ message: "No logueado"});

        const usuario = await User.findById(userId).select('-password'); 
        if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json({ user: usuario });
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener perfil' });
    }
};