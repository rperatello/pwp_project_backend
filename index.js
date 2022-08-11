require('dotenv').config();
const path = require('path')
const express = require('express');
const app = express();
const consign = require('consign')
const port = process.env.PORT || 8080

app.use(express.urlencoded({ extended: true }));

consign()
    .include('./config/passport.js')
    .then('./config/middlewares.js')
    .then('./config/auth.js')
    .then('./rotas/rotas.js')
    .into(app)

/*LISTEN DO EXPRESS*/

app.listen(port, function () {
    console.log("Rodando na porta " + port);
});
