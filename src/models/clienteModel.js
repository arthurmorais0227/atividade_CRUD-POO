import prisma from "../utils/prismaClient.js";

export default class ClienteModel {
  constructor({
    id = null,
    nome = null,
    telefone = null,
    email = null,
    cpf = null,
    cep = null,
    logradouro = null,
    bairro = null,
    localidade = null,
    uf = null,
    ativo = true,
    pedidos = [],
  } = {}) {
    this.id = id;
    this.nome = nome;
    this.telefone = telefone;
    this.email = email;
    this.cpf = cpf;
    this.cep = cep;
    this.logradouro = logradouro;
    this.bairro = bairro;
    this.localidade = localidade;
    this.uf = uf;
    this.ativo = ativo;
    this.pedidos = pedidos;
  }

  async criar() {
    //não pede de email mas o erro ta me enchendo o saco então vou criar
    const emailExistente = await prisma.cliente.findFirst({
      where: { email: this.email },
    });

    if (emailExistente) {
      return { status: 409, error: "Email já cadastrado." };
    }

    //eu que to escrevendo thiago/marcelo, 27/02 20:54 - validação cpf 11 numeros
    if (!/^\d{11}$/.test(this.cpf)) {
      return { status: 400, error: "CPF deve conter 11 dígitos numéricos." };
    }

    //eu que to escrevendo thiago/marcelo, 27/02 20:57 - validação se cpf existe
    const cpfExistente = await prisma.cliente.findFirst({
      where: { cpf: this.cpf },
    });

    if (cpfExistente) {
      return { status: 409, error: "CPF já cadastrado." };
    }

    //eu que to escrevendo thiago/marcelo, 27/02 21:00 - validação cep 8 numeros
    if (!/^\d{8}$/.test(this.cep)) {
      return { status: 400, error: "CEP deve conter 8 dígitos numéricos." };
    }

    //eu que to escrevendo thiago/marcelo, 27/02 21:03 - validação se telefone existe
    const telefoneExistente = await prisma.cliente.findFirst({
      where: { telefone: this.telefone },
    });

    if (telefoneExistente) {
      return { status: 409, error: "Telefone já cadastrado." };
    }

    return prisma.cliente.create({
      data: {
        nome: this.nome,
        telefone: this.telefone,
        email: this.email,
        cpf: this.cpf,
        cep: this.cep,
        logradouro: this.logradouro,
        bairro: this.bairro,
        localidade: this.localidade,
        uf: this.uf,
        ativo: this.ativo,
      },
    });
  }

  async atualizar() {
    const emailExistente = await prisma.cliente.findFirst({
      where: { email: this.email },
    });

    if (emailExistente && emailExistente.id !== this.id) {
      return { status: 409, error: "Email já cadastrado." };
    }

    if (!/^\d{11}$/.test(this.cpf)) {
      return { status: 400, error: "CPF deve conter 11 dígitos numéricos." };
    }

    const cpfExistente = await prisma.cliente.findFirst({
      where: { cpf: this.cpf },
    });

    if (cpfExistente && cpfExistente.id !== this.id) {
      return { status: 409, error: "CPF já cadastrado." };
    }

    if (!/^\d{8}$/.test(this.cep)) {
      return { status: 400, error: "CEP deve conter 8 dígitos numéricos." };
    }

    const telefoneExistente = await prisma.cliente.findFirst({
      where: { telefone: this.telefone },
    });

    if (telefoneExistente && telefoneExistente.id !== this.id) {
      return { status: 409, error: "Telefone já cadastrado." };
    }

    const atualizado = await prisma.cliente.update({
      where: { id: this.id },
      data: {
        nome: this.nome,
        telefone: this.telefone,
        email: this.email,
        cpf: this.cpf,
        cep: this.cep,
        logradouro: this.logradouro,
        bairro: this.bairro,
        localidade: this.localidade,
        uf: this.uf,
        ativo: this.ativo,
      },
    });

    return {
      status: 200,
      message: "Cliente atualizado com sucesso.",
      data: atualizado,
    };
  }

  async deletar() {
    const pedidoAberto = await prisma.pedido.findFirst({
      where: {
        clienteId: this.id,
        status: "ABERTO",
      },
    });

    if (pedidoAberto) {
      return {
        status: 400,
        error: "Não é possível deletar cliente com pedido em status ABERTO.",
      };
    }

    const pedidoRelacionado = await prisma.pedido.findFirst({
      where: { clienteId: this.id },
    });

    if (pedidoRelacionado) {
      return {
        status: 400,
        error:
          "Não é possível deletar o cliente pois ele possui pedidos vinculados.",
      };
    }

    await prisma.cliente.delete({
      where: { id: this.id },
    });

    return { status: 200 };
  }

  static async buscarTodos(filtros = {}) {
    const where = {};

    if (filtros.nome)
      where.nome = { contains: filtros.nome, mode: "insensitive" };

    if (filtros.cpf !== undefined) where.cpf = { contains: filtros.cpf };

    if (filtros.ativo !== undefined) {
      where.ativo = filtros.ativo === "true" || filtros.ativo === true;
    }

    return prisma.cliente.findMany({ where });
  }

  static async buscarPorId(id) {
    const data = await prisma.cliente.findUnique({ where: { id } });
    if (!data) return null;
    return new ClienteModel(data);
  }
}
