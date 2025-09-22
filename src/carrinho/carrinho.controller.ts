import { Request, Response } from 'express'
class CarrinhoController{
    adicionar(req:Request, res:Response) {
        res.send("Terezinho de Jesus")
    }
    listar(req:Request, res:Response) {
        res.send("Terezinho de Jesus")
    }
}

export default new CarrinhoController()