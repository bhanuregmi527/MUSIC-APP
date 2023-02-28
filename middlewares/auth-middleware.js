const jwt =require("jsonwebtoken");
const mysql= require('mysql2');
const pool= mysql.createPool({
    host: process.env.DB_HOST,
    user:process.env.DB_USER,
    database:process.env.DB_NAME
  });



var checkUserAuth = async(req,res,next)=>{
    let token
    const {authorization}= req.headers
    console.log(req.headers)
    if(authorization && authorization.startsWith('Bearer')){
        try {
            token= authorization.split(' ')[1] 
            console.log(token)
            // verify token 
            const {userID}= jwt.verify(token, process.env.JWT_SECRET_KEY)
            console.log(userID)
            //GET USER FROM TOKEN
            const [rows, fields] = await pool.promise().query('SELECT * FROM users WHERE id = ?', [userID]);
            const user = rows[0];
            req.user=user
            console.log(user); 
            next()
        } catch (error) {
            res.status(401).send({"status":"failed", "message":"unauthorized User"})
        }
    }
    if(!token){
        res.status(403).send({"status":"failed", "message":"unauthorized User, No Token"})
    } 
}
module.exports= checkUserAuth  