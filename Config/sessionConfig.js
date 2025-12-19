import session, { Cookie } from 'express-session'

export const sessionMiddleware =  session({
    secret:"this is a password",
    resave:false,
    saveUninitialized:false,
    Cookie:{
        maxAge:100*60*60
    }
})