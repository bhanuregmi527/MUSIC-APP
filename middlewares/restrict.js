const restrictTo= (...roles)=>{
    return (req,res,next)=>{
        const user=req.user
   
    // roles may be in array eg:['admin','mod']
        console.log(user)
        if(!roles.includes(user.role)){
            return next( 
                res.status(401).send({"status":"failed", "message":"You are not a authorized User"}))
        }
        next();
    };
    
};

module.exports= restrictTo