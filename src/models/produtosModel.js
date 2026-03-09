import prisma from "../utils/prismaClient.js";

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
      typeof disponivel === "string"
        ? disponivel === "true"
        : Boolean(disponivel);
  }

  async criar() {
    // CORREÇÃO: Usar 'this' em vez de 'produto'
    if (this.disponivel === false) {
      return {
        status: 400,
        error: "Não é possível criar um produto inicialmente indisponível",
      };
    }

    // Validações de Nome
    if (!this.nome || this.nome.length < 3) {
      return {
        status: 400,
        error: "Nome do produto deve ter no mínimo 3 caracteres.",
      };
    }

    // Validação de Descrição
    if (this.descricao && this.descricao.length > 255) {
      return {
        status: 400,
        error: "Descrição deve ter no máximo 255 caracteres.",
      };
    }

    // Validação de Preço
    if (!this.preco || this.preco <= 0) {
      return { status: 400, error: "Preço deve ser maior que 0." };
    }

    // Regex para 2 casas decimais
    if (!/^\d+(\.\d{1,2})?$/.test(this.preco.toString())) {
      return {
        status: 400,
        error: "Preço deve ter no máximo 2 casas decimais.",
      };
    }

    try {
      return await prisma.produto.create({
        data: {
          nome: this.nome,
          descricao: this.descricao,
          categoria: this.categoria,
          preco: this.preco,
          disponivel: this.disponivel,
        },
      });
    } catch (dbError) {
      // Log para você debugar no terminal o erro real do banco
      console.error("Erro Prisma:", dbError);
      throw dbError;
    }
  }

  async atualizar() {
    if (!this.id) return { status: 400, error: "ID inválido." };

    // CORREÇÃO: O buscarPorId já foi feito no Controller,
    // mas se for manter aqui, use this.id
    const produtoExiste = await prisma.produto.findUnique({
      where: { id: this.id },
    });

    if (!produtoExiste) {
      return { status: 404, error: "Produto não encontrado." };
    }

    // ... restante da lógica de atribuição do 'data' ...
    const data = {
      nome: this.nome,
      descricao: this.descricao,
      categoria: this.categoria,
      preco: this.preco,
      disponivel: this.disponivel,
    };

    return await prisma.produto.update({
      where: { id: this.id },
      data,
    });
  }

  async deletar() {
    // Verificação de segurança antes de deletar
    const itemEmPedidoAberto = await prisma.itemPedido.findFirst({
      where: { produtoId: this.id, pedido: { status: "ABERTO" } },
    });

    // REGRA DE NEGÓCIO: Não pode deletar produto vinculado a pedido ABERTO
    if (itemEmPedidoAberto)
      return {
        status: 400,
        error: "Não é possível deletar produto vinculado a pedido em aberto.",
      };

    return await prisma.produto.delete({ where: { id: this.id } });
  }

  static async buscarTodos(filtros = {}) {
    const where = {};
    if (filtros.nome)
      where.nome = { contains: filtros.nome, mode: "insensitive" };

    if (filtros.categoria) {
      where.categoria = filtros.categoria.toUpperCase();
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
