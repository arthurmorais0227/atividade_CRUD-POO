import prisma from '../utils/prismaClient.js';

export default class ItemPedidoModel {
    constructor({
        id = null,
        pedidoId = null,
        produtoId = null,
        quantidade = 0,
        precoUnitario = 0,
    } = {}) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.produtoId = produtoId;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
    }

    async criar() {
        if (!this.pedidoId) {
            throw new Error('O campo pedidoId é obrigatório.');
        }

        if (!this.produtoId) {
            throw new Error('O campo produtoId é obrigatório.');
        }

        if (!this.quantidade || this.quantidade <= 0 || this.quantidade > 99) {
            throw new Error('Quantidade deve ser maior que 0 e no máximo 99.');
        }

        const produto = await prisma.produto.findUnique({
            where: { id: this.produtoId },
        });

        if (!produto) {
            throw new Error('Produto não encontrado.');
        }

        if (!produto.disponivel) {
            throw new Error('Não é possível adicionar produto indisponível.');
        }

        this.precoUnitario = produto.preco;

        const criado = await prisma.itemPedido.create({
            data: {
                pedidoId: this.pedidoId,
                produtoId: this.produtoId,
                quantidade: this.quantidade,
                precoUnitario: this.precoUnitario,
            },
            include: {
                produto: true,
                pedido: true,
            },
        });

        return criado;
    }

    async atualizar() {
        const existente = await prisma.itemPedido.findUnique({
            where: { id: this.id },
            include: {
                pedido: true,
            },
        });

        if (!existente) {
            return {
                status: 404,
                error: 'ItemPedido não encontrado.',
            };
        }

        if (existente.pedido.status === 'PAGO' || existente.pedido.status === 'CANCELADO') {
            return {
                status: 400,
                error: 'Não é possível alterar item de pedido finalizado.',
            };
        }

        if (this.quantidade !== undefined && (this.quantidade <= 0 || this.quantidade > 99)) {
            return {
                status: 400,
                error: 'Quantidade deve ser maior que 0 e no máximo 99.',
            };
        }

        let novoPrecoUnitario = existente.precoUnitario;
        if (this.produtoId && this.produtoId !== existente.produtoId) {
            const novoProduto = await prisma.produto.findUnique({
                where: { id: this.produtoId },
            });
            if (!novoProduto) {
                return {
                    status: 400,
                    error: 'Novo produto não encontrado.',
                };
            }
            if (!novoProduto.disponivel) {
                return {
                    status: 400,
                    error: 'Não é possível alterar para produto indisponível.',
                };
            }
            novoPrecoUnitario = novoProduto.preco;
        }

        const atualizado = await prisma.itemPedido.update({
            where: { id: this.id },
            data: {
                produtoId: this.produtoId ?? existente.produtoId,
                quantidade: this.quantidade ?? existente.quantidade,
                precoUnitario: novoPrecoUnitario,
            },
            include: {
                produto: true,
                pedido: true,
            },
        });

        return {
            status: 200,
            message: 'ItemPedido atualizado com sucesso.',
            data: atualizado,
        };
    }

    async deletar() {
        const existente = await prisma.itemPedido.findUnique({
            where: { id: this.id },
            include: {
                pedido: true,
            },
        });

        if (!existente) {
            return {
                status: 404,
                error: 'ItemPedido não encontrado.',
            };
        }

        if (existente.pedido.status === 'PAGO' || existente.pedido.status === 'CANCELADO') {
            return {
                status: 400,
                error: 'Não é possível deletar item de pedido finalizado.',
            };
        }

        await prisma.itemPedido.delete({
            where: { id: this.id },
        });

        return {
            status: 200,
            message: 'ItemPedido deletado com sucesso.',
        };
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.pedidoId) where.pedidoId = parseInt(filtros.pedidoId);

        if (filtros.produtoId) where.produtoId = parseInt(filtros.produtoId);

        return prisma.itemPedido.findMany({
            where,
            include: {
                produto: true,
                pedido: true,
            },
        });
    }

    static async buscarPorId(id) {
        const data = await prisma.itemPedido.findUnique({
            where: { id },
            include: {
                produto: true,
                pedido: true,
            },
        });

        if (!data) return null;

        return new ItemPedidoModel(data);
    }
}
