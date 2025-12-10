require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');


const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 4000; 


app.use(cors({
    origin: [
        'http://localhost', 
        'http://127.0.0.1',
        'http://23.23.138.3',      
        'http://23.23.138.3:80'    
    ], 
    credentials: true 
}));


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); 


const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://MatiasFull1:MatiasSuertazo@cluster0.0xni1q9.mongodb.net/suerteDB?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Backend: Conectado a MongoDB Atlas'))
    .catch(err => {
        console.error('❌ Backend: Error conectando a Mongo:', err);
        process.exit(1);
    });


app.use('/api', apiRoutes);


app.listen(PORT, () => {
    console.log(`📡 Backend escuchando en http://localhost:${PORT}`);
});