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

        if (!this.nome || this.nome.length < 3) {
            throw new Error('Nome do produto deve ter no mínimo 3 caracteres.');
        }

          if (this.descricao && this.descricao.length > 255) {
              throw new Error('Descrição deve ter no máximo 255 caracteres.');
        }

         if (!this.preco || this.preco <= 0) {
             throw new Error('Preço deve ser maior que 0.');
        }

        if (!/^\d+(\.\d{1,2})?$/.test(this.preco.toString())) {
            throw new Error('Preço deve ter no máximo 2 casas decimais.');
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
            throw new Error('ID_INVALIDO');
        }

        if (this.nome && this.nome.length < 3) {
            throw new Error("Nome do produto deve ter no mínimo 3 caracteres");
        }

        if (this.descricao && this.descricao.length > 255) {
            throw new Error("Descrição deve ter no máximo 255 caracteres");
        }

        if (this.preco !== null && this.preco <= 0) {
            throw new Error("Preço deve ser maior que 0.");
        }

         if (this.preco !== null && !/^\d+(\.\d{1,2})?$/.test(this.preco.toString())) {
             throw new Error('Preço deve ter no máximo 2 casas decimais.');
        }

        const data = {};
        if (this.nome !== null) data.nome = this.nome;
        if (this.descricao !== null) data.descricao = this.descricao;
        if (this.categoria !== null) data.categoria = this.categoria;
        if (this.preco !== null) data.preco = this.preco;
        if (this.disponivel !== null) data.disponivel = this.disponivel;

        return await prisma.produto.update({
            where: { id: this.id },
            data
        });

    }

    async deletar() {
        // Verificação de segurança antes de deletar
        const itemEmPedidoAberto = await prisma.itemPedido.findFirst({
            where: { produtoId: this.id, pedido: { status: 'ABERTO' } },
        });

        if (itemEmPedidoAberto) throw new Error('PRODUTO_VINCULADO');

        return await prisma.produto.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};
        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };

        if (filtros.categoria) {
            where.categoria = filtros.categoria;
        }

        if (filtros.precoMin) {
            where.preco = { gte: parseFloat
            (filtros.precoMin) };
        }

        if (filtros.precoMax) {
            where.preco = { ...where.preco, lte:
            parseFloat(filtros.precoMax) };
        }

        const results = await prisma.produto.findMany({ where });

        return results.map((p) => new ProdutoModel(p));
    }

    static async buscarPorId(id) {
        const data = await prisma.produto.findUnique({ where: { id: Number(id) } });

        return data ? new ProdutoModel(data) : null;
    }
}
