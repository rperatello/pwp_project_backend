const { response } = require("express");

async function conecta() {
    const banco = require("mysql2/promise");
    const con = await banco.createConnection({
        host: process.env.DB_HOST, 
        user: process.env.DB_USER, 
        password: process.env.DB_PASSWORD, 
        database: process.env.DB_NAME
    });
    con.connect();
    console.log("Banco de dados conectado!!");
    return con;
}

//usuarios
async function login(usuario) {
    console.log("Verificando login");
    const conexaoAtiva = await conecta();
    const [resultado] = await conexaoAtiva.query("SELECT * FROM users WHERE login = ?;", [usuario.login]);
    // console.log("login resultado", resultado)
    if (resultado.length == 0) { return 400 }
    if (resultado[0].password != usuario.password) { return 409}
    // return response = {status: "conectado", admin: resultado[0].admin == 1 ? true : false  };
    return resultado[0];
}

//usuarios
async function listaTodosUsuarios() {
    console.log("Listando todos usuários");
    const conexaoAtiva = await conecta();
    var [resultado] = await conexaoAtiva.query("SELECT * FROM users");
    resultado.forEach(x => delete x.password);
    return resultado
}

async function selecionaUsuario(id) {
    console.log(`Selecionado o usuário com id: ${id}`);
    const conexaoAtiva = await conecta();
    var [resultado] = await conexaoAtiva.query("SELECT * FROM users WHERE id=?;", [id]);
    if (resultado.length == 0) {return "Não existe usuário com o ID informado!"}
    resultado.forEach(x => delete x.password);
    return resultado[0];
}

async function insereUsuario(usuario) {
    console.log("Inserindo usuário: " +  usuario.name);
    const conexaoAtiva = await conecta();
    const [resultado] = await conexaoAtiva.query("SELECT * FROM users WHERE login = ?;", [usuario.login]);
    if (resultado.length > 0 ) { return "Já existe um usuário com o login informado!"}
    const sql = "INSERT INTO users(name, login, password, isAdmin) VALUES (?,?,?,?);";
    const parametros = [usuario.name, usuario.login, usuario.password, usuario.isAdmin];
    const [response] = await conexaoAtiva.query(sql, parametros);
    console.log(`Usuário inserido com ID: ${response.insertId}.`)
    return `Usuário inserido com sucesso!`
}

async function excluiUsuario(id) {
    console.log(`Apagando o usuário com id:${id}`);
    const conexaoAtiva = await conecta();
    const [resultado] = await conexaoAtiva.query("SELECT * FROM users WHERE id=?;", [id]);
    if (resultado.length == 0) {return "Não existe usuário com o ID informado!"}
    const [response] = await conexaoAtiva.query("DELETE FROM users WHERE id=?", [id]);
    return `Usuário excluído com sucesso!`
}

async function alteraUsuario(usuario) {
    // console.log("Alterando usuário: " + JSON.stringify(usuario));
    const conexaoAtiva = await conecta();    
    const [resultado] = await conexaoAtiva.query("SELECT * FROM users WHERE id=?;", [usuario.id]);
    
    if (resultado.length == 0) {return "Não existe usuário com o ID informado!"}
    const sql = "UPDATE users SET name = ?, password = ?, isAdmin = ? WHERE id = ?;";
    const parametros = [usuario.name, usuario.password, usuario.isAdmin, usuario.id];
    const [response] = await conexaoAtiva.query(sql, parametros);
    return `Dados alterados com sucesso!`
}

module.exports = { 
    login, listaTodosUsuarios, selecionaUsuario, insereUsuario, excluiUsuario, alteraUsuario
}
