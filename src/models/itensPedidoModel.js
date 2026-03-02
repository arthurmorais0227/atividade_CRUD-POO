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

        if (!this.quantidade || this.quantidade <= 0) {
            throw new Error('Quantidade deve ser maior que 0.');
        }

        const produto = await prisma.produto.findUnique({
            where: { id: this.produtoId },
        });

        if (!produto) {
            throw new Error('Produto não encontrado.');
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

        if (this.quantidade !== undefined && this.quantidade <= 0) {
            return {
                status: 400,
                error: 'Quantidade deve ser maior que 0.',
            };
        }

        const atualizado = await prisma.itemPedido.update({
            where: { id: this.id },
            data: {
                produtoId: this.produtoId ?? existente.produtoId,
                quantidade: this.quantidade ?? existente.quantidade,
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

        if (existente.pedido.status === 'PAGO') {
            return {
                status: 400,
                error: 'Não é possível deletar item de pedido PAGO.',
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
