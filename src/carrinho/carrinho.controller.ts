import { Request, Response } from "express";
import { db } from "../database/banco-mongo.js";
import { ObjectId } from "mongodb";

interface ItemCarrinho {
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
    nome: string;
}

interface Carrinho {
    _id?: ObjectId;
    usuarioId: string;
    itens: ItemCarrinho[];
    dataAtualizacao: Date;
    total: number;
}

class CarrinhoController {

    async adicionarItem(req: Request, res: Response) {
        try {
            const { usuarioId, produtoId, quantidade } = req.body;

            if (!usuarioId || !produtoId || !quantidade || quantidade <= 0) {
                return res.status(400).json({ error: "Dados inválidos: produtoId, usuarioId e quantidade devem ser maior que 0!" });
            }

            const produto = await db.collection('produtos').findOne({ _id: new ObjectId(produtoId) });
            if (!produto) {
                return res.status(404).json({ error: "O produto não foi encontrado" });
            }

            let carrinho = await db.collection('carrinhos').findOne({ usuarioId: usuarioId }) as Carrinho | null;

            if (carrinho) {
                const itemExistenteIndex = carrinho.itens && Array.isArray(carrinho.itens)
                    ? carrinho.itens.findIndex(item => item.produtoId === produtoId)
                    : -1;

                if (carrinho.itens && itemExistenteIndex > -1) {
                    if (carrinho.itens && carrinho.itens[itemExistenteIndex]) {
                        carrinho.itens[itemExistenteIndex].quantidade += quantidade;
                    }
                } else if (carrinho.itens) {
                    carrinho.itens.push({
                        produtoId: produtoId,
                        quantidade: quantidade,
                        precoUnitario: produto.preco,
                        nome: produto.nome,
                    });
                }
                carrinho.dataAtualizacao = new Date();
            } else {
                carrinho = {
                    usuarioId: usuarioId,
                    itens: [{
                        produtoId: produtoId,
                        quantidade: quantidade,
                        precoUnitario: produto.preco,
                        nome: produto.nome,
                    }],
                    dataAtualizacao: new Date(),
                    total: 0 
                };
            }

            carrinho.total = carrinho.itens.reduce((soma, item) => {
                return soma + (item.quantidade * item.precoUnitario);
            }, 0);

            // Banco de dados
            const resultado = await db.collection('carrinhos').updateOne(
                { usuarioId: usuarioId },
                { $set: carrinho }, 
                { upsert: true } //cria se não existir, atualiza se existir
            );

            return res.status(200).json(carrinho);

        } catch (error) {
            console.error("Erro ao adicionar item ao carrinho:", error);
            if (error instanceof Error && error.message.includes("")) {
                 return res.status(400).json({ error: "Formato do \"produtoId\" é inválido" });
            }
            return res.status(500).json({ error: "Erro no servidor" });
        }
    }

    async removerItem(req: Request, res: Response) {
        try {
            const { usuarioId, produtoId } = req.body;

             if (!usuarioId || !produtoId) {
                return res.status(400).json({ error: "Dados inválidos: usuarioId e produtoId devem ser fornecidos!" });
            }

            const carrinho = await db.collection('carrinhos').findOne({ usuarioId: usuarioId }) as Carrinho | null;

            if (!carrinho) {
                return res.status(404).json({ error: "Carrinho não encontrado" });
            }

            carrinho.itens = carrinho.itens.filter(item => item.produtoId !== produtoId);
            carrinho.dataAtualizacao = new Date();
            
            carrinho.total = carrinho.itens.reduce((soma, item) => soma + (item.quantidade * item.precoUnitario), 0);
            
            await db.collection('carrinhos').updateOne({ usuarioId: usuarioId }, { $set: carrinho });

            return res.status(200).json(carrinho);

        } catch (error) {
            console.error("Erro ao remover item do carrinho:", error);
            return res.status(500).json({ error: "Erro no servidor" });
        }
    }

    async atualizarQuantidade(req: Request, res: Response) {
        try {
            const { usuarioId, produtoId, quantidade } = req.body;
             
            if (!usuarioId || !produtoId || quantidade === undefined) {
                return res.status(400).json({ error: "Dados inválidos: usuarioId, produtoId e quantidade devem ser fornecidos!" });
            }
            
            const carrinho = await db.collection('carrinhos').findOne({ usuarioId: usuarioId }) as Carrinho | null;
            if (!carrinho) {
                return res.status(404).json({ error: "Carrinho não encontrado" });
            }

            const itemIndex = carrinho.itens.findIndex(item => item.produtoId === produtoId);
            if (itemIndex === -1) {
                return res.status(404).json({ error: "O item não foi encontrado" });
            }

            if (quantidade > 0) {
                if (carrinho.itens && carrinho.itens[itemIndex]) {
                    carrinho.itens[itemIndex].quantidade = quantidade;
                }
            } else {
                if (carrinho.itens) {
                    carrinho.itens.splice(itemIndex, 1);
                }
            }

            carrinho.dataAtualizacao = new Date();
            carrinho.total = carrinho.itens.reduce((soma, item) => soma + (item.quantidade * item.precoUnitario), 0);

            await db.collection('carrinhos').updateOne({ usuarioId: usuarioId }, { $set: carrinho });

            return res.status(200).json(carrinho);

        } catch (error) {
             console.error("Erro ao atualizar quantidade do item:", error);
            return res.status(500).json({ error: "Erro no servidor" });
        }
    }

    async listar(req: Request, res: Response) {
        try {
            const { usuarioId } = req.params; 
            const carrinho = await db.collection('carrinhos').findOne({ usuarioId: usuarioId });

            if (!carrinho) {
                return res.status(404).json({ error: "O carrinho não foi encontrado" });
            }

            return res.status(200).json(carrinho);
        } catch (error) {
            console.error("Erro ao listar carrinho:", error);
            return res.status(500).json({ error: "Erro no servidor" });
        }
    }
    
    async remover(req: Request, res: Response) {
        try {
            const { usuarioId } = req.params;
            const resultado = await db.collection('carrinhos').deleteOne({ usuarioId: usuarioId });

            if (resultado.deletedCount === 0) {
                 return res.status(404).json({ error: "Carrinho não encontrado" });
            }

            return res.status(204).send();

        } catch (error) {
            console.error("Erro ao remover carrinho:", error);
            return res.status(500).json({ error: "Erro no servidor" });
        }
    }
}

export default new CarrinhoController();