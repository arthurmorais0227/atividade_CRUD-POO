import prisma from '../utils/prismaClient.js';
import PedidoModel from './pedidoModel.js';

export default class ClienteModel {
  constructor({
    id = null,
    nome,
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
      // REGRA DE NEGÓCIO:Email unico
      const emailExistente = await prisma.cliente.findFirst({
          where: { email: this.email },
      });

      if (emailExistente) {
          return { status: 409, error: 'Email já cadastrado.' };
      }

      // REGRA DE NEGÓCIO: CPF com 11 digitos
      if (!/^\d{11}$/.test(this.cpf)) {
          return { status: 400, error: 'CPF deve conter 11 dígitos numéricos.' };
      }

      // REGRA DE NEGÓCIO: CPF existe
      const cpfExistente = await prisma.cliente.findFirst({
          where: { cpf: this.cpf },
      });

      if (cpfExistente) {
          return { status: 409, error: 'CPF já cadastrado.' };
      }

      // REGRA DE NEGÓCIO: CEP com 8 digitos
      if (!/^\d{8}$/.test(this.cep)) {
          return { status: 400, error: 'CEP deve conter 8 dígitos numéricos.' };
      }

      // REGRA DE NEGÓCIO: Telefone com 10 ou 11 digitos
      const telefoneExistente = await prisma.cliente.findFirst({
          where: { telefone: this.telefone },
      });

      if (telefoneExistente) {
          return { status: 409, error: 'Telefone já cadastrado.' };
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
        // REGRA DE NEGÓCIO:Email unico
        const emailExistente = await prisma.cliente.findFirst({
            where: { email: this.email },
        });

        if (emailExistente && emailExistente.id !== this.id) {
            return { status: 409, error: 'Email já cadastrado.' };
        }
        // REGRA DE NEGÓCIO: CPF com 11 digitos
        if (!/^\d{11}$/.test(this.cpf)) {
            return { status: 400, error: 'CPF deve conter 11 dígitos numéricos.' };
        }
        // REGRA DE NEGÓCIO:CPF unico
        const cpfExistente = await prisma.cliente.findFirst({
            where: { cpf: this.cpf },
        });

        if (cpfExistente && cpfExistente.id !== this.id) {
            return { status: 409, error: 'CPF já cadastrado.' };
        }

        if (!/^\d{8}$/.test(this.cep)) {
            return { status: 400, error: 'CEP deve conter 8 dígitos numéricos.' };
        }

        const telefoneExistente = await prisma.cliente.findFirst({
            where: { telefone: this.telefone },
        });

        if (telefoneExistente && telefoneExistente.id !== this.id) {
            return { status: 409, error: 'Telefone já cadastrado.' };
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
            message: 'Cliente atualizado com sucesso.',
            data: atualizado,
        };
    }

    async deletar() {
        // REGRA DE NEGÓCIO: Não pode deletar cliente com pedido em status ABERTO
        const pedidoAberto = await prisma.pedido.findFirst({
            where: {
                clienteId: this.id,
                status: 'ABERTO',
            },
        });

        if (pedidoAberto) {
            return {
                status: 400,
                error: 'Não é possível deletar cliente com pedido em status ABERTO.',
            };
        }

        const pedidoRelacionado = await prisma.pedido.findFirst({
            where: { clienteId: this.id },
        });

        if (pedidoRelacionado) {
            return {
                status: 400,
                error: 'Não é possível deletar o cliente pois ele possui pedidos vinculados.',
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

    //sou eu que to escrevendo thiago/marcelo, 28/02 09:23  - só pra exibir os pedidos de cada cliente
    // agora traz também os itens de cada pedido
    const results = await prisma.cliente.findMany({
      where,
      orderBy: {
        id: "asc", // ordem crescente
      },
      include: {
        pedidos: { include: { itens: { include: { produto: true } } } },
      },
    });

    return results.map(
      (data) =>
        new ClienteModel({
          ...data,
          pedidos: data.pedidos.map((p) => new PedidoModel(p)),
        }),
    );
  }

  static async buscarPorId(id) {
    const data = await prisma.cliente.findUnique({
      where: { id },
      include: {
        pedidos: { include: { itens: { include: { produto: true } } } },
      },
    });
    if (!data) return null;
    return new ClienteModel({
      ...data,
      pedidos: data.pedidos.map((p) => new PedidoModel(p)),
    });
  }
}
