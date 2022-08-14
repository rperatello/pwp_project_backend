const authSecret = process.env.SECRET
const jwt = require('jwt-simple')
const md5 = require('md5');

const banco = require("../database/dbRepository");

module.exports = _app => {
    const login = async (req, res) => {
        if (!req.body.login || !req.body.password) {
            res.status(401).send({message: "Informe usuário e senha!"})
        } else {
            const resultado = await banco.login({
                login: req.body.login,
                password: md5(req.body.password),
            });
            if (!resultado || resultado == 400) { return res.status(400).send({message: "Usuário não cadastrado!"}) }
            if (resultado == 409) { return res.status(400).send({message: "Senha não confere!"}) }
            const isMath = md5(req.body.password) == resultado.password ? true : false
            if (!isMath) { return res.status(401).send({message: "Acesso negado!"}) }
            
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
            const userData = req.headers.authorization || null
            if (userData) {
                const token = jwt.decode(userData.substring(7), authSecret)
                if (new Date(token.exp) > new Date()) {
                    return res.send({message: "Token válido!"})
                }
            }
            return res.status(401).send({message: "Token expirado!"})
        } catch (e) { 
            return res.status(401).send({message: "Token com problema de assinatura!"})
        }
    }

    return { login, validateToken }

}