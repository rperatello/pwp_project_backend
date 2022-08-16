
async function getConnection() {
    try {
        const database = require("mysql2/promise")
        const con = await database.createConnection({
            host: process.env.DB_HOST, 
            user: process.env.DB_USER, 
            password: process.env.DB_PASSWORD, 
            database: process.env.DB_NAME
        });
        con.connect()
        console.log("database conected")
        return con
    } catch (error) {
        throw new Error('database failed to connect')
    }
    
}

async function login(user) {
    let connection
    try {
        console.log("Verificando login")
        connection = await getConnection()
        let [result] = await connection.query("SELECT * FROM users WHERE login = ?;", [user.login])
        if (result.length == 0) { return 400 }
        if (result[0].password != user.password) { return 409}
        return result[0]
    } catch (error) {
        throw error
    } finally
    { connection.end() }
}

async function getUsersList() {
    let connection
    try {
        console.log("Listando usuários")
        connection = await getConnection()
        let [result] = await connection.query("SELECT * FROM users")
        result.forEach(x => delete x.password)      
        return result        
    } catch (error) {        
        throw error
    } finally
    { connection.end() }
}

async function getUser(id) {
    let connection
    try {
        console.log(`Selecionado usuário com id: ${id}`)
        connection = await getConnection()
        let [result] = await connection.query("SELECT * FROM users WHERE id=?;", [id])
        if (result.length == 0) {return "Não existe usuário com o ID informado!"}
        result.forEach(x => delete x.password)
        return result[0]
    } catch (error) {        
        throw error
    } finally
    { connection.end() }
    
}

async function insertUser(user) {
    let connection
    try {        
        console.log("Inserindo usuário: " +  user.name)
        connection = await getConnection()
        let [result] = await connection.query("SELECT * FROM users WHERE login = ?;", [user.login])
        if (result.length > 0 ) { return "Já existe um usuário com o login informado!"}
        const sql = "INSERT INTO users(name, login, password, email) VALUES (?,?,?,?);"
        const parameters = [user.name, user.login, user.password, user.email];
        [result] = await connection.query(sql, parameters)
        console.log(`Usuário inserido com ID: ${result.insertId}.`)
        return `Usuário inserido com sucesso!`
    } catch (error) {        
        throw error
    } finally
    { connection.end() }
}

async function deleteUser(id) {
    let connection
    try {
        console.log(`Apagando usuário com id: ${id}`)
        connection = await getConnection()
        let [result] = await connection.query("SELECT * FROM users WHERE id=?;", [id])
        if (result.length == 0) {return "Não existe usuário com o ID informado!"}
        [result] = await connection.query("DELETE FROM users WHERE id=?", [id])
        return `Usuário excluído com sucesso!`        
    } catch (error) {        
        throw error
    } finally
    { connection.end() }
}

async function updateUser(user) {
    let connection
    try {
        console.log(`Alterando usuário com id: ${user.id}`)
        connection = await getConnection()
        let [result] = await connection.query("SELECT * FROM users WHERE id=?;", [user.id])        
        if (result.length == 0) {return "Não existe usuário com o ID informado!"}
        const sql = "UPDATE users SET name = ?, password = ?, email = ? WHERE id = ?;"
        const parameters = [user.name, user.password, user.email, user.id];
        [result] = await connection.query(sql, parameters)
        console.log(result)
        return `Dados alterados com sucesso!`
    } catch (error) {
        throw error
    } finally{
        connection.end()
    }    
}

//produtos
async function getProductList() {
    let connection
    try {
        console.log("Listando todos os produtos")
        connection = await getConnection()
        let [result] = await connection.query("SELECT * FROM products")
        result.forEach(x => x.offer = x.offer == 1 ? true : false)
        return result        
    } catch (error) {
        throw error
    } finally{
        connection.end()
    }
}

async function getProduct(id) {
    let connection
    try {
        connection = await getConnection();
        const [result] = await connection.query("SELECT * FROM products WHERE id=?;", [id])
        if (result.length == 0) {return "Não existe produto com o ID informado!"}
        result.forEach(x => x.offer = x.offer == 1 ? true : false)
        return result[0]       
    } catch (error) {
        throw error
    } finally{
        connection.end()
    }    
}

async function insertProduct(product) {
    let connection
    try {
        connection = await getConnection();
        let [result] = await connection.query("SELECT * FROM products WHERE TRIM(UPPER(description)) = ?;", [product.description.toUpperCase().trim()])
        if (result.length > 0 ) { return "Produto já cadastrado!"}
        const sql = "INSERT INTO products(description, url_image, price, offer) VALUES (?,?,?,?);"
        const parameters = [product.description, product.url_image, product.price, product.offer];
        [result] = await connection.query(sql, parameters)
        console.log(`Produto inserido com sucesso (ID: ${result.insertId})`)
        return `Produto inserido com sucesso!`        
    } catch (error) {
        throw error
    } finally{
        connection.end()
    }
}

async function deleteProduct(id) {
    let connection
    try {
        console.log(`Apagando produto com id: ${id}`);
        connection = await getConnection();
        let [result] = await connection.query("SELECT * FROM products WHERE id=?;", [id])
        if (result.length == 0) {return "Não existe produto com o ID informado!"}
        [result] = await connection.query("DELETE FROM products WHERE id=?", [id])
        console.log(result);
        return `Produto excluído com sucesso!`        
    } catch (error) {
        throw error
    } finally{
        connection.end()
    }
}

async function updateProduct(product) {
    let connection
    try {
        connection = await getConnection();    
        let [result] = await connection.query("SELECT * FROM products WHERE id=?;", [product.id])
        if (result.length == 0) {return "Não existe produto com o ID informado!"}
        const sql = "UPDATE products SET description = ?, url_image = ?, price = ?, offer = ? WHERE id = ?;"
        const parameters = [product.description, product.url_image, product.price, product.offer, product.id];
        [result] = await connection.query(sql, parameters);
        return `Dados alterados com sucesso!`        
    } catch (error) {
        throw error
    } finally{
        connection.end()
    }       
}

module.exports = { 
    login, getUsersList, getUser, insertUser, deleteUser, updateUser,
    getProductList, getProduct, insertProduct, deleteProduct, updateProduct
}
