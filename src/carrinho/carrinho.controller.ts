import { Request, Response } from "express";
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
    async adicionarItem(req:Request, res:Response) {
        console.log(req.body);
        console.log("Chegou na rota de adicionar item ao carrinho");
        const { usuarioId, produtoId, quantidade } = req.body;
        const produto = await db.collection("produtos").findOne({ _id: ObjectId.createFromHexString(produtoId)});
        if (!produto) {
            return res.status(400).json({ message: "Produto não encontrado" });
        }

        const precoUnitario = produto.preco;
        const nome = produto.nome;
        const carrinhoExistente = await db.collection("carrinhos").findOne({ usuarioId: usuarioId });

        if (carrinhoExistente) {
            const novoCarrinho: Carrinho = {
                usuarioId: usuarioId,
                itens: [
                    {
                        produtoId: produtoId,
                        quantidade: quantidade,
                        precoUnitario: precoUnitario,
                        nome: nome
                    }
                ],
                dataAtualizacao: new Date(),
                total: precoUnitario * quantidade
            };
            await db.collection("carrinhos").insertOne(novoCarrinho);
        } else {
            await db.collection("carrinhos").updateOne(
                { usuarioId: usuarioId },
                {
                    push: { itens: { produtoId, quantidade, precoUnitario, nome } },
                    $set: { dataAtualizacao: new Date() }
                }
            );
        }
        const carrinhoAtualizado = await db.collection("carrinhos").findOne({ usuarioId: usuarioId });
        if (carrinhoAtualizado) {
            const total = carrinhoAtualizado.itens.reduce((acc:any, item:any) => acc + item.precoUnitario * item.quantidade, 0);
            await db.collection("carrinhos").updateOne(
                { usuarioId: usuarioId },
                { $set: { total: total } }
            );
        }

        res.status(200).json({ message: "O item adicionado ao carrinho" });          
    } 
    
    async removerItem(req: Request, res: Response) {
    const { usuarioId, produtoId } = req.body;
    await db.collection("carrinhos").updateOne(
     { usuarioId: usuarioId },
     { pull: { itens: { produtoId: produtoId } } }
     );
        res.status(200).json({ message: "Item removido do carrinho" });
    }

    async atualizarQuantidade(req: Request, res: Response) {
        const { usuarioId, produtoId, quantidade } = req.body;
        await db.collection("carrinhos").updateOne(
            { usuarioId: usuarioId, "itens.produtoId": produtoId },
            { $set: { "itens.$.quantidade": quantidade } }
        );
        res.status(200).json({ message: "Quantidade atualizada!" });
    }

    //Listagem
    async listar(req: Request, res: Response) {
        const { usuarioId } = req.body;
        const carrinho = await db.collection("carrinhos").findOne({ usuarioId: usuarioId });
        if (!carrinho) {
            return res.status(404).json({ message: "Carrinho não encontrado" });
        }
        res.status(200).json(carrinho);
    }

    //Deletar             
    async remover(req: Request, res: Response) {
        const { usuarioId } = req.body;
        await db.collection("carrinhos").deleteOne({ usuarioId: usuarioId });
        res.status(200).json({ message: "O carrinho foi removido" });
    }

}
export default new CarrinhoController();