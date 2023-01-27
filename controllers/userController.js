
const bcrypt = require('bcryptjs');
const  jwt=require('jsonwebtoken');
const  dotenv =require('dotenv')

dotenv.config()
const mysql = require ('mysql2')
const pool=  mysql.createConnection({
    host: process.env.DB_HOST,
    user:process.env.DB_USER,
    database:process.env.DB_NAME
  });

class UserController{
    static userRegistration = async (req,res)=>{  
        const {name,email,password,password_confirm,role}=req.body
        const result = await pool.promise().query(`SELECT * FROM users WHERE email = ?`, [email]);   
        const user=result[0]   
        if(user.length>0){
            res.send({"status":"failed","message":"Email already exit"});
            }
            else{
            if(name&&email&&password&& password_confirm,role){
                if(password===password_confirm){
                    try {
                        const salt = await bcrypt.genSalt(10)
                        const hashPassword= await bcrypt.hash(password,salt)
                  
                      pool.promise().query('INSERT INTO users SET ?', { name: name, email: email, password: hashPassword,role:role});
                  
                      const [rows, fields] = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);              
                    //  const saved_user =  await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);
                   const saved_user= rows[0];
                   console.log(saved_user.id)
                    // generate JWT token
                   const secret = process.env.JWT_SECRET_KEY
                    const token= jwt.sign({userID:saved_user.id},secret,{expiresIn:'5d'})
                    console.log(token)
                    res.send({"status":"success","message":"Registration success","token":token})
                    
                    } catch (error) {
                      console.log(error)  
                    }

                }else{
                    res.send({"status":"failed","message":"password and password_confirm doesnot match"})
                }
            }else{
                res.send({"status":"failed","message":"All fields are required"})  
            }
        }
    }

    static userLogin = async (req,res)=>{
    
        try {
            const {email,password}=req.body
            if(email&&password){
                const [rows, fields] = await pool.promise().query('SELECT * FROM users WHERE email = ?', [email]);
                const user = rows[0];             
                if(user !==null){
                    const isMatch= await bcrypt.compare(password,user.password)
                    if((user.email===email) && isMatch){
                        //generate JWT token
                        const secret = process.env.JWT_SECRET_KEY
                        const token = jwt.sign({userID:user.id},secret,{expiresIn:'5d'})

                        res.send({"status":"success","message":"Login successfully","token":token})

                    }else{
                        res.send({"status":"failed","message":"Email or password doesnot match"})
                    }
                }else{
                    res.send({"status":"failed","message":"Your are not a Registered User"}) 
                }
            }else{
                res.send({"status":"failed","message":"All fields are required"})  
            }
        } catch (error) {
            console.log(error)
        }
    }

    static changeUserPassword= async (req,res)=>{
        const {password,password_confirm}=req.body
        if(password&&password_confirm){
            if(password!==password_confirm){
                res.send({"status":"failed","message":"Password and Password-confirm doesnot match"}) 
            }else{
                const salt= await bcrypt.genSalt(10) 
                const newHashPassword= await bcrypt.hash(password,salt)
                await pool.promise().query('UPDATE users SET password = ? WHERE id = ?', [newHashPassword, req.body.id]);
                console.log(req.users)
                res.send({"status":"failed","message":"Password Changed Succesfully"}) 
            }
        }else{
            res.send({"status":"failed","message":"All fields are required"}) 
        }
    }
    static loggedUser = async (req, res) => {
        pool.query("SELECT * FROM users WHERE isDeleted=false", function (error, results, fields) {
            if (error) throw error;
            res.send(results);
          });
      }

    static deleteUserById= async(req,res)=>{
        const id= req.params.id
        pool.query('UPDATE users SET isDeleted=true  WHERE id = ?',[id], function (error, results, fields) {
        if (error) throw error;
     res.send(' deleted user from the database');
        });

      }
}
module.exports= UserController
