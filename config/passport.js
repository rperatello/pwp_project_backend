const authSecret = process.env.SECRET
const passport = require("passport")
const passportJwt = require("passport-jwt")
const { Strategy, ExtractJwt } = passportJwt
const banco = require('../database/conexao')

module.exports = _app => {
    const params = {
        secretOrKey: authSecret,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    }

    const strategy = new Strategy(params, (payload, done) => {  
        // console.log('payload :>> ', JSON.stringify(payload));      
        const user = banco.selecionaUsuario(payload.id);
        if (user != 'Não existe usuário com o ID informado!') {            
            return done(null, { ...payload })
        } else
        { return false }
        
    })

    passport.use(strategy)

    
    return {
        authenticate: () => passport.authenticate('jwt', {session: false})
    }
}