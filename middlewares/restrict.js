const restrictTo= (...roles)=>{
    return (req,res,next)=>{
        const user=req.user
        console.log(user.role)
   
    // roles may be in array eg:['admin','mod']
        console.log(user)
        if(!roles.includes(user.role)){
            return next( 
                res.status(403).send({"status":"failed", "message":"Empty"}))
        }
        next();
    };
    
};

module.exports= restrictTo