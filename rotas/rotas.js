
const { body, validationResult } = require("express-validator");
const { read } = require("fs");
const md5 = require('md5');
const banco = require("../database/conexao")

module.exports = app => {

    //*ROTAS - Login
    app.post("/login", app.config.auth.login)
    app.post("/validatetoken", app.config.auth.validateToken)

    /*ROTAS - CRUD DE USUÁRIOS*/
    //lista usuários
    app.route("/user")
        .all(app.config.passport.authenticate())
        .get(async (_req, res) => {
        const resultado = await banco.listaTodosUsuarios();
        res.send(resultado);
    });

    //insere usuário
    app.route("/user")
    .all(app.config.passport.authenticate())
    .post([
        body("login", "O login é obrigatório e deve possuir de 3 a 45 caracteres.").trim().isLength({ min: 3, max: 45 }),
        body("name", "O name deve possuir no máximo 250 caracteres.").trim().isLength({ max: 250 }),
        body("password", "A senha precisa ter no mínimo 3 e no máximo 20 caracteres.").trim().isLength({ min: 3, max: 20 }),
        body("isAdmin").trim().custom(value => {
            if (parseInt(value) < 0 || parseInt(value) > 1) {
                return Promise.reject('A propriedade isAdmin deve receber o valor 0 (falso) ou 1 (verdadeiro).')
            }
            return value;
        }),
        ],
        async (req, res) => {
            const erros = validationResult(req);
            if (!erros.isEmpty()) {
                res.status(400).send(erros.array())
            } else {
                const resultado = await banco.insereUsuario({
                    login: req.body.login,
                    name: req.body.name,
                    password: md5(req.body.password),
                    isAdmin: req.body.isAdmin,
                });
                if (resultado == "Já existe um usuário com o login informado!"){
                    res.status(400).send({msg: resultado})
                }
                else {
                    res.send({msg: resultado});
                }
            }
        });

    
    //altera usuário
    app.route("/user")
        .all(app.config.passport.authenticate())
        .put([
            body("id", "O id do usuário é obrigatório.").trim().isLength({ min: 1 }),
            body("id", "O id deve ser um número!").trim().isNumeric(),
            body("login", "O login é obrigatório e deve possuir de 3 a 45 caracteres.").trim().isLength({ min: 3, max: 45 }),
            body("name", "O name deve possuir no máximo 250 caracteres.").trim().isLength({ max: 250 }),
            body("password", "A senha precisa ter no mínimo 3 e no máximo 20 caracteres.").trim().isLength({ min: 3, max: 20 }),
            body("isAdmin").trim().custom(value => {
                if (parseInt(value) < 0 || parseInt(value) > 1) {
                    return Promise.reject('A propriedade isAdmin deve receber o valor 0 (falso) ou 1 (verdadeiro).')
                }
                return value;
            }),
        ],
            async (req, res) => {
                const erros = validationResult(req);
                if (!erros.isEmpty()) {
                    res.status(400).send(erros.array())
                } else {
                    const resultado = await banco.alteraUsuario({
                        id: req.body.id,
                        login: req.body.login,
                        name: req.body.name,
                        password: md5(req.body.password),
                        isAdmin: req.body.isAdmin,
                    });
                    if (resultado == "Não existe usuário com o ID informado!" || "Já existe um usuário com o login informado!"){
                        res.status(400).send({msg: resultado})
                    }
                    else {
                        res.send({msg: resultado});
                    }
                }
            }
        );

    
    //exclui usuário
    app.route("/user/:id?")
        .all(app.config.passport.authenticate())
        .delete(async (req, res) => {
            if (req.params.id) {
                const resultado = await banco.excluiUsuario(req.params.id);
                if (resultado == "Não existe usuário com o ID informado!"){
                    res.status(400).send({msg: resultado})
                }
                else {
                    res.send({msg: resultado});
                }
            } else {
                res.status(400).send({msg: "Obrigatório informar um id de usuário válido!"})
            }          
    });

    //dados usuário
    app.route("/user/:id?")
        .all(app.config.passport.authenticate())
        .get(async (req, res) => {
        if (req.params.id) {
            const resultado = await banco.selecionaUsuario(req.params.id);
            if (resultado == "Não existe usuário com o ID informado!"){
                res.status(400).send({msg: resultado})
            }
            else {
                res.send(resultado);
            }
        } else {
            res.status(400).send({msg: "Obrigatório informar um id de usuário válido!"})
        }
    });    

}
