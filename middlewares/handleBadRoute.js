const handleBadRoute=(req,res,next)=>{
    const error = new Error("Not Found");
    error.status = 404;
    console.log(error)
    next(error);
}
module.exports=handleBadRoute;