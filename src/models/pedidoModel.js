import prisma from '../utils/prismaClient.js';

export default class PedidoModel {
    constructor({
        id = null,
        clienteId = null,
        total = 0,
        status = 'ABERTO',
        criadoEm = null,
        itens = [],
    } = {}) {
        this.id = id;
        this.clienteId = clienteId;
        this.total = total;
        this.status = status;
        this.criadoEm = criadoEm;
        this.itens = itens;
    }

    async criar() {
        // REGRA DE NEGÓCIO: Pedido inicia obrigatoriamente com status ABERTO
        this.status = 'ABERTO';

        const totalCalculado = this.itens.reduce((acc, item) => {
            return acc + Number(item.quantidade) * Number(item.precoUnitario);
        }, 0);

        const cliente = await prisma.cliente.findUnique({
            where: { id: this.clienteId },
        });

        if (!cliente) {
            return {
                status: 404,
                error: 'Cliente não encontrado.',
            };
        }
        // REGRA DE NEGÓCIO: Não pode criar pedido para cliente com ativo = false
        if (cliente.ativo === false) {
            return {
                status: 400,
                error: 'Não é possível criar o pedido de um cliente inativo',
            };
        }

        return prisma.pedido.create({
            data: {
                clienteId: this.clienteId,
                status: this.status,
                total: totalCalculado,
                itens: {
                    create: this.itens.map((item) => ({
                        produtoId: item.produtoId,
                        quantidade: item.quantidade,
                        precoUnitario: item.precoUnitario,
                    })),
                },
            },
            include: {
                itens: true,
            },
        });
    }

    async atualizar() {
        const pedidoAtual = await prisma.pedido.findUnique({
            where: { id: this.id },
        });

        if (!pedidoAtual) {
            return { status: 404, error: 'Pedido não encontrado.' };
        }
        //REGRA DE NEGÓCIO: Não pode adicionar itens se o pedido estiver PAGO ou CANCELADO
        if (pedidoAtual.status === 'PAGO' || pedidoAtual.status === 'CANCELADO') {
            return {
                status: 400,
                error: `Não é possível alterar um pedido com status PAGO ou CANCELADO.`,
            };
        }
        // REGRA DE NEGÓCIO: Só pode cancelar pedido se estiver ABERTO
        if (this.status === 'CANCELADO' && pedidoAtual.status !== 'ABERTO') {
            return {
                status: 400,
                error: 'Só é possível cancelar pedidos que ainda estão ABERTOS.',
            };
        }
        // REGRA DE NEGÓCIO: Total calculado automaticamente com base nos itens
        const totalCalculado =
            this.itens.length > 0
                ? this.itens.reduce(
                      (acc, item) => acc + Number(item.quantidade) * Number(item.precoUnitario),
                      0,
                  )
                : pedidoAtual.total;

        const atualizado = await prisma.pedido.update({
            where: { id: this.id },
            data: {
                status: this.status,
                total: totalCalculado,
            },
        });

        return {
            status: 200,
            message: 'Pedido atualizado com sucesso.',
            data: atualizado,
        };
    }

    async deletar() {
        if (this.status !== 'ABERTO') {
            return {
                status: 400,
                error: 'Só é possível cancelar um pedido ABERTO',
            };
        }

        if (this.status === 'PAGO') {
            return {
                status: 400,
                error: 'Não é possível deletar um pedido que já foi PAGO.',
            };
        }

        await prisma.itemPedido.deleteMany({
            where: { pedidoId: this.id },
        });

        await prisma.pedido.delete({
            where: { id: this.id },
        });

        return { status: 200 };
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.clienteId) where.clienteId = parseInt(filtros.clienteId);
        if (filtros.status) where.status = filtros.status;

        return prisma.pedido.findMany({
            where,
            include: {
                cliente: true,
                itens: {
                    include: {
                        produto: true,
                    },
                },
            },
        });
    }

    static async buscarPorId(id) {
        const data = await prisma.pedido.findUnique({
            where: { id },
            include: {
                itens: true,
            },
        });

        if (!data) return null;
        return new PedidoModel(data);
    }
}
