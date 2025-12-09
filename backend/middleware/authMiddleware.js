exports.verificarSesion = (req, res, next) => {
    
    if (!req.cookies.usuario_id) {
        
        return res.status(401).json({ 
            success: false, 
            message: 'No autorizado. Por favor inicia sesión.' 
        });
    }
    
    next();
};