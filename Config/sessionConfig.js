import session, { Cookie } from 'express-session'

export const sessionMiddleware =  session({
    secret:"this is a password",
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:100*60*60
    }
})