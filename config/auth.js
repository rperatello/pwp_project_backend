const authSecret = process.env.SECRET
const jwt = require('jwt-simple')
const md5 = require('md5');
// const bcrypt = require('bcrypt-node-js')

const banco = require("../database/conexao");

module.exports = app => {
    const login = async (req, res) => {
        if (!req.body.login || !req.body.password) {
            res.status(401).send({msg: "Informe usuário e senha!"})
        } else {
            const resultado = await banco.login({
                login: req.body.login,
                password: md5(req.body.password),
            });
            // console.log("resultado: ", resultado)
            if (!resultado || resultado == 400) { return res.status(400).send({msg: "Usuário não cadastrado!"}) }
            if (resultado == 409) { return res.status(400).send({msg: "Senha não confere!"}) }
            // const isMath = bcrypt.compareSync(req.body.senha, resultado.senha)
            const isMath = md5(req.body.password) == resultado.password ? true : false
            if (!isMath) { return res.status(401).send({msg: "Acesso negado!"}) }
            
            const now = Math.floor(Date.now())
            
            const payload = {
                id: resultado.id,
                name: resultado.name,
                isAdmin: resultado.isAdmin,
                iat: now,
                exp: now + (1000 * 60 * 60 * 2)
            }

            res.json({
                ...payload,
                token: jwt.encode(payload, authSecret)
            })
        }
    }

    const validateToken = async (req, res) => {
        try {
            // console.log('req :>> ', req);
            const userData = req.headers.authorization || null
            // console.log('userData :>> ', userData.substring(7))
            if (userData) {
                const token = jwt.decode(userData.substring(7), authSecret)
                // console.log('Exp do Token :>> ', new Date(token.exp));
                if (new Date(token.exp) > new Date()) {
                    return res.send({msg: "Token válido!"})
                }
            }
            return res.status(401).send({msg: "Token expirado!"})
        } catch (e) { 
            return res.status(401).send({msg: "Token expirado!"})
        }
    }

    return { login, validateToken }

}