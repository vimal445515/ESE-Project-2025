import bcryt from 'bcrypt'

const passwordHash = (password) =>{
    const saltCout = 10;
    const salt = bcryt.genSaltSync(saltCout);
    return bcryt.hashSync(password,salt)
}

const comparePassword = (textPassword,hashedPassword) =>{
    return bcryt.compareSync(textPassword,hashedPassword)
}

export default{
    passwordHash,
    comparePassword
}