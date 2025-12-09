require('dotenv').config();
const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const cookieParser = require('cookie-parser');

const app = express();
// El Frontend corre en el puerto 80 (el puerto web por defecto)
const PORT = process.env.PORT || 80; 

// ====== CONFIGURACIÓN HANDLEBARS (Igual que antes) ======
app.engine('handlebars', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        eq: (a, b) => a === b,
    },
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// ====== MIDDLEWARES ======
// Carpeta 'public' contiene tu css, js y assets (antes llamada assets)
app.use(express.static(path.join(__dirname, 'assets'))); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware visual: Verifica si hay cookie para mostrar opciones de menú correctas
const checkCookie = (req, res, next) => {
    // Esto solo sirve para que el HTML sepa si mostrar "Bienvenido Juan" o "Iniciar Sesión".
    // La seguridad real de los datos está en el Backend (puerto 4000).
    res.locals.isLoggedIn = !!req.cookies.usuario_id;
    res.locals.username = req.cookies.username || 'Usuario';
    next();
};

app.use(checkCookie);

// ====== RUTAS DE VISTAS (Solo renderizan HTML) ======

// Públicas
app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
    if (res.locals.isLoggedIn) return res.redirect('/welcome');
    res.render('login', { layout: 'aux1' });
});

app.get('/register', (req, res) => {
    if (res.locals.isLoggedIn) return res.redirect('/welcome');
    res.render('register', { layout: 'aux1' });
});

// Privadas (Si no hay cookie, te manda al login)
app.get('/welcome', (req, res) => {
    if (!res.locals.isLoggedIn) return res.redirect('/login');
    res.render('welcome', { username: res.locals.username });
});

app.get('/roulette', (req, res) => {
    if (!res.locals.isLoggedIn) return res.redirect('/login');
    // Renderizamos la vista "vacía" de datos. 
    // Tu archivo 'roulette.js' se encargará de rellenar el saldo y el historial después.
    res.render('roulette', { 
        username: res.locals.username,
        saldo: "...", 
        ultimosNumeros: [], 
        ultimasApuestas: []
    });
});

app.get('/userProfile', (req, res) => {
    if (!res.locals.isLoggedIn) return res.redirect('/login');
    res.render('userProfile', { 
        username: res.locals.username,
        email: "...",
        saldo: "...",
        transacciones: []
    });
});
//////////////////////////////////////////////////////
app.get('/rules', (req, res) => {
    res.render('rules', { layout: 'main' });
});

app.get('/devInformation', (req, res) => {
    res.render('devInformation', { layout: 'main' });
});
/////////////////////////////////////////////////
app.get('/transaction', (req, res) => {
    if (!res.locals.isLoggedIn) return res.redirect('/login');
    res.render('transaction', { 
        layout: 'aux1',
        username: res.locals.username, 
        saldo: "..." 
    });
});
//////////////////////////////////////////////
app.get('/logout', (req, res) => {
    // Si no está logueado, ¿para qué va a salir? Lo mandamos al login
    if (!res.locals.isLoggedIn) return res.redirect('/login');
    
    // Renderizamos tu vista logout.hbs
    res.render('logout', { layout: 'aux1' }); 
});

app.get('/logoutConfirm', (req, res) => {
    res.clearCookie('usuario_id');
    res.clearCookie('username');
    res.redirect('/login');
});
////////////////////////////////////////////////////
// ====== INICIAR SERVIDOR FRONTEND ======
app.listen(PORT, () => {
    console.log(`🌍 Frontend corriendo en http://localhost:${PORT}`);
});