import prisma from '../utils/prismaClient.js';

export default class ProdutoModel {
    constructor({
        id = null,
        nome = null,
        descricao = null,
        categoria = null,
        preco = null,
        disponivel = true,
    } = {}) {
        this.id = id ? Number(id) : null;
        this.nome = nome;
        this.descricao = descricao;
        this.categoria = categoria;
        this.preco = preco !== null ? parseFloat(preco) : null;
        this.disponivel =
            typeof disponivel === 'string' ? disponivel === 'true' : Boolean(disponivel);
    }

    async criar() {
        // REGRA DE NEGÓCIO: Nome obrigatório e mínimo 3 caracteres
        if (!this.nome || this.nome.length < 3) {
            return { status: 400, error: 'Nome do produto deve ter no mínimo 3 caracteres.' };
        }

        // REGRA DE NEGÓCIO: Descrição máximo 255 caracteres
        if (this.descricao && this.descricao.length > 255) {
            return { status: 400, error: 'Descrição deve ter no máximo 255 caracteres.' };
        }

        if (!this.preco || this.preco <= 0) {
            return { status: 400, error: 'Preço deve ser maior que 0.' };
        }

        // REGRA DE NEGÓCIO: Preço obrigatório, maior que 0 e no máximo 2 casas decimais
        if (!/^\d+(\.\d{1,2})?$/.test(this.preco.toString())) {
            return { status: 400, error: 'Preço deve ter no máximo 2 casas decimais.' };
        }



        return await prisma.produto.create({
            data: {
                nome: this.nome,
                descricao: this.descricao,
                categoria: this.categoria,
                preco: this.preco,
                disponivel: this.disponivel,
            },
        });
    }

    async atualizar() {
        if (!this.id) {
            return { status: 400, error: 'ID inválido.' };
        }

        if (this.nome && this.nome.length < 3) {
            return { status: 400, error: 'Nome do produto deve ter no mínimo 3 caracteres.' };
        }

        if (this.descricao && this.descricao.length > 255) {
            return { status: 400, error: 'Descrição deve ter no máximo 255 caracteres.' };
        }

        if (this.preco !== null && this.preco <= 0) {
            return { status: 400, error: 'Preço deve ser maior que 0.' };
        }

        if (this.preco !== null && !/^\d+(\.\d{1,2})?$/.test(this.preco.toString())) {
            return { status: 400, error: 'Preço deve ter no máximo 2 casas decimais.' };
        }

        const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
        if (!produto) {
            return { status: 404, error: 'Produto não encontrado.' };
        }
        if (!produto.disponivel) {
            return { status: 400, error: 'Não é possível adicionar produto indisponível.' };
        }

        const data = {};
        if (this.nome !== null) data.nome = this.nome;
        if (this.descricao !== null) data.descricao = this.descricao;
        if (this.categoria !== null) data.categoria = this.categoria;
        if (this.preco !== null) {
            this.preco = parseFloat(this.preco);
            data.preco = this.preco;
        }
        if (this.disponivel !== null) {
            this.disponivel =
                typeof this.disponivel === 'string'
                    ? this.disponivel === 'true'
                    : Boolean(this.disponivel);
            data.disponivel = this.disponivel;
        }

        return await prisma.produto.update({
            where: { id: this.id },
            data,
        });
    }

    async deletar() {
        // Verificação de segurança antes de deletar
        const itemEmPedidoAberto = await prisma.itemPedido.findFirst({
            where: { produtoId: this.id, pedido: { status: 'ABERTO' } },
        });

        // REGRA DE NEGÓCIO: Não pode deletar produto vinculado a pedido ABERTO
        if (itemEmPedidoAberto)
            return {
                status: 400,
                error: 'Não é possível deletar produto vinculado a pedido em aberto.',
            };

        return await prisma.produto.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};
        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };

        if (filtros.categoria) {
            where.categoria = filtros.categoria;
        }

        if (filtros.precoMin) {
            where.preco = { gte: parseFloat(filtros.precoMin) };
        }

        if (filtros.precoMax) {
            where.preco = { ...where.preco, lte: parseFloat(filtros.precoMax) };
        }

        const results = await prisma.produto.findMany({ where });

        return results.map((p) => new ProdutoModel(p));
    }

    static async buscarPorId(id) {
        const data = await prisma.produto.findUnique({ where: { id: Number(id) } });

        return data ? new ProdutoModel(data) : null;
    }
}
