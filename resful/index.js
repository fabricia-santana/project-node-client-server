const express = require('express');
const consign = require('consign');
const bodyParse = require('body-parser');

let app = express();

app.use(bodyParse.urlencoded({extended: false, limit:'50mb'}));
app.use(bodyParse.json({limit:'50mb'}));

consign().include('routes').include('utils').into(app);

app.listen(4000, '127.0.0.1', ()=>{
    console.log('Servidor rodando!');
});

