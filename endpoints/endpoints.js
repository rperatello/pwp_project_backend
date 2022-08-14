
const { body, validationResult } = require("express-validator");
const { read } = require("fs");
const md5 = require('md5');
const database = require("../database/dbRepository")

module.exports = app => {

    //*ROTAS - Login
    app.post("/login", app.config.auth.login)
    app.post("/validatetoken", app.config.auth.validateToken)

    /*ROTAS - CRUD DE USUÁRIOS*/
    //lista usuários
    app.route("/user")
        .all(app.config.passport.authenticate())
        .get(async (_req, res) => {
            try {
                const result = await database.getUsersList();
                res.send(result);                
            } catch(error){
                res.status(500).send({message: error.message})
            }
    });

    //insere usuário
    app.route("/user")
    .all(app.config.passport.authenticate())
    .post([
        body("login", "O login é obrigatório e deve possuir de 3 a 45 caracteres.").trim().isLength({ min: 3, max: 45 }),
        body("name", "O name deve possuir no máximo 250 caracteres.").trim().isLength({ max: 250 }),
        body("password", "A senha precisa ter no mínimo 3 e no máximo 20 caracteres.").trim().isLength({ min: 3, max: 20 }),
        body("email", "Informe um e-mail válido.").trim().normalizeEmail().isEmail()      
        ],
        async (req, res) => {
            try{
                const erros = validationResult(req);
                if (!erros.isEmpty()) {
                    res.status(400).send(erros.array())
                } else {
                    const result = await database.insertUser({
                        login: req.body.login,
                        name: req.body.name,
                        password: md5(req.body.password),
                        email: req.body.email,
                    });
                    if (result == "Já existe um usuário com o login informado!"){
                        res.status(400).send({message: result})
                    }
                    else {
                        res.send({message: result});
                    }
                }
            } catch(error){
                res.status(500).send({message: error.message})
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
            body("email", "Informe um e-mail válido.").trim().normalizeEmail().isEmail()
        ],
            async (req, res) => {
                try{
                    const erros = validationResult(req);
                    if (!erros.isEmpty()) {
                        res.status(400).send(erros.array())
                    } else {
                        const result = await database.updateUser({
                            id: req.body.id,
                            login: req.body.login,
                            name: req.body.name,
                            password: md5(req.body.password),
                            email: req.body.email,
                        });
                        if (result == "Não existe usuário com o ID informado!" || "Já existe um usuário com o login informado!"){
                            res.status(400).send({message: result})
                        }                    
                        else {
                            res.send({message: result});
                        }
                    }
                }
                catch(error){
                    res.status(500).send({message: error.message})
                }
            }
        );

    
    //exclui usuário
    app.route("/user/:id?")
        .all(app.config.passport.authenticate())
        .delete(async (req, res) => {
            try {
                if (req.params.id) {
                    const result = await database.deleteUser(req.params.id);
                    if (result == "Não existe usuário com o ID informado!"){
                        res.status(400).send({message: result})
                    }
                    else {
                        res.send({message: result});
                    }
                } else {
                    res.status(400).send({message: "Obrigatório informar um id de usuário válido!"})
                }                
            } catch(error){
                res.status(500).send({message: error.message})
            }
    });

    //dados usuário
    app.route("/user/:id?")
        .all(app.config.passport.authenticate())
        .get(async (req, res) => {
            try {
                if (req.params.id) {
                    const result = await database.getUser(req.params.id);
                    if (result == "Não existe usuário com o ID informado!"){
                        res.status(400).send({message: result})
                    }
                    else {
                        res.send(result);
                    }
                } else {
                    res.status(400).send({message: "Obrigatório informar um id de usuário válido!"})
                }                
            } catch(error){
                res.status(500).send({message: error.message})
            }
    });   
    
    
    /*ROTAS - CRUD DE PRODUTOS*/

    app.route("/product")
        .all(app.config.passport.authenticate())
        .get(async (_req, res) => {
            try {
                const result = await database.getProductList();
                res.send(result);                
            } catch(error){
                res.status(500).send({message: error.message})
            }
    });

    app.route("/product")
    .all(app.config.passport.authenticate())
    .post([
        body("description", "A descrição do produto e deve possuir de 3 a 250 caracteres.").trim().isLength({ min: 3, max: 250 }),
        body("url_image", "A url da imagem deve possuir no máximo 500 caracteres.").trim().isLength({ max: 500 }),
        body("price").trim().isFloat({ min: 0 }),
        body("offer").trim().custom(value => {
            if (parseInt(value) < 0 || parseInt(value) > 1) {
                return Promise.reject('A propriedade oferta deve receber o valor 0 (falso) ou 1 (verdadeiro).')
            }
            return value;
        }),
        ],
        async (req, res) => {            
            try {
                if (req.body.offer == "true" || req.body.offer == "false")
                    req.body.offer = req.body.offer == "true" ? 1 : 0
                const erros = validationResult(req);
                if (!erros.isEmpty()) {
                    res.status(400).send(erros.array())
                } else {
                    const result = await database.insertProduct({
                        description: req.body.description,
                        url_image: req.body.url_image,
                        price: req.body.price,
                        offer: req.body.offer,
                    });
                    if (result == "Produto já cadastrado!"){
                        res.status(400).send({message: result})
                    }
                    else {
                        res.send({message: result});
                    }
                }                
            } catch(error){
                res.status(500).send({message: error.message})
            }
        });

    app.route("/product")
    .all(app.config.passport.authenticate())
    .put([
        body("id", "O id do produto é obrigatório.").trim().isLength({ min: 1 }),
        body("id", "O id deve ser um número!").trim().isNumeric(),
        body("description", "A descrição do produto e deve possuir de 3 a 250 caracteres.").trim().isLength({ min: 3, max: 250 }),
        body("url_image", "A url da imagem deve possuir no máximo 500 caracteres.").trim().isLength({ max: 500 }),
        body("price").trim().isFloat({ min: 0 }),
        body("offer").trim().custom(value => {
            if (parseInt(value) < 0 || parseInt(value) > 1) {
                return Promise.reject('A propriedade oferta deve receber o valor 0 (falso) ou 1 (verdadeiro).')
            }
            return value;
        }),
        ],
        async (req, res) => {
            try {
                if (req.body.offer == "true" || req.body.offer == "false")
                    req.body.offer = req.body.offer == "true" ? 1 : 0
                const erros = validationResult(req);
                if (!erros.isEmpty()) {
                    res.status(400).send(erros.array())
                } else {
                    const result = await database.updateProduct({
                        id: req.body.id,
                        description: req.body.description,
                        url_image: req.body.url_image,
                        price: req.body.price,
                        offer: req.body.offer,
                    });
                    if (result == "Não existe produto com o ID informado!"){
                        res.status(400).send({message: result})
                    }
                    else {
                        res.send({message: result});
                    }
                }                
            } catch(error){
                res.status(500).send({message: error.message})
            }
        });

    app.route("/product/:id?")
    .all(app.config.passport.authenticate())
    .delete(async (req, res) => {
        try {
            if (req.params.id) {
                const result = await database.deleteProduct(req.params.id);
                if (result == "Não existe produto com o ID informado!"){
                    res.status(400).send({message: result})
                }
                else {
                    res.send({message: result});
                }
            } else {
                res.status(400).send({message: "Obrigatório informar um id de produto válido!"})
            }                
        } catch(error){
            res.status(500).send({message: error.message})
        }
    });

    app.route("/product/:id?")
        .all(app.config.passport.authenticate())
        .get(async (req, res) => {
            try {
                if (req.params.id) {
                    const result = await database.getProduct(req.params.id);
                    if (result == "Não existe produto com o ID informado!"){
                        res.status(400).send({message: result})
                    }
                    else {
                        res.send(result);
                    }
                } else {
                    res.status(400).send({message: "Obrigatório informar um id de produto válido!"})
                }                
            } catch(error){
                res.status(500).send({message: error.message})
            }
    });   

}
