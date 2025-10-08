//Criar um middleware que bloqueia tudo
import { Request, Response, NextFunction } from "express";
function Auth(req:Request,res:Response,next:NextFunction){
    console.log("Cheguei no middleware e bloqueei")
    return res.status(401).json({mensagem:"Bloqueia tudo!"})
}

export default Auth;