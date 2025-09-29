import { Request, Response } from "express";
//import aqui as dependências necessárias
import { ObjectId } from "bson";
import { db } from "../database/banco-mongo.js";

interface ItemCarrinho {
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
    nome: string;
}

interface Carrinho {
    usuarioId: string;
    itens: ItemCarrinho[];
    dataAtualizacao: Date;
    total: number;
}
class CarrinhoController {
    //adicionarItem
    async adicionarItem(req:Request, res:Response) {
        console.log("Chegou na rota de adicionar item ao carrinho");
        const { usuarioId, produtoId, quantidade } = req.body;
         //Buscar o produto no banco de dados
        const produto = await db.collection("produtos").findOne({ _id: ObjectId.createFromHexString(produtoId)});
        if (!produto) {
            return res.status(400).json({ message: "Produto não encontrado" });
        }
        //Pegar o preço do produto
        //Pegar o nome do produto
        const precoUnitario = produto.preco; // Supondo que o produto tenha um campo 'preco'
        const nome = produto.nome; // Supondo que o produto tenha um campo 'nome'


        // Verificar se um carrinho com o usuário já existe
        // Se não existir deve criar um novo carrinho
        // Se existir, deve adicionar o item ao carrinho existente

        // Calcular o total do carrinho

        // Atualizar a data de atualização do carrinho

        res.status(200).json({ message: "Item adicionado ao carrinho com sucesso" });
        

        

        

    } 
       
        






    //removerItem
    //atualizarQuantidade
    //listar
    //remover                -> Remover o carrinho todo

}
export default new CarrinhoController();