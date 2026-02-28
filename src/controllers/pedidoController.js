import pedidoModel from "../models/pedidoModel.js";

export const criar = async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ error: "Corpo da requisição vazio. Envie os dados!" });
    }

    const {
      clienteId,
      total,
      status,
      itens
    } = req.body;

    if (!clienteId)
      return res.status(400).json({ error: 'O campo "clienteId" é obrigatório!' });
    if (total === undefined)
      return res.status(400).json({ error: 'O campo "total" é obrigatório!' });
    if (!status)
      return res.status(400).json({ error: 'O campo "status" é obrigatório!' });
    if (!itens || !Array.isArray(itens) || itens.length === 0)
      return res.status(400).json({ error: 'O pedido deve conter pelo menos um item no campo "itens"!' });

    const pedido = new pedidoModel({
      clienteId,
      total,
      status,
      itens
    });
    
    const data = await pedido.criar();

    res.status(201).json({ message: "Registro criado com sucesso!", data });
  } catch (error) {
    console.error("Erro ao criar:", error);
    res.status(500).json({ error: "Erro interno ao salvar o registro." });
  }
};

export const buscarTodos = async (req, res) => {
  try {
    const registros = await pedidoModel.buscarTodos(req.query);

    if (!registros || registros.length === 0) {
      return res.status(200).json({ message: "Nenhum registro encontrado." });
    }

    res.json(registros);
  } catch (error) {
    console.error("Erro ao buscar:", error);
    res.status(500).json({ error: "Erro ao buscar registros." });
  }
};

export const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ error: "O ID enviado não é um número válido." });
    }

    const pedido = await pedidoModel.buscarPorId(parseInt(id));

    if (!pedido) {
      return res.status(404).json({ error: "Registro não encontrado." });
    }

    res.json({ data: pedido });
  } catch (error) {
    console.error("Erro ao buscar:", error);
    res.status(500).json({ error: "Erro ao buscar registro." });
  }
};

export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const pedido = await pedidoModel.buscarPorId(parseInt(id));

    if (!pedido) {
      return res
        .status(404)
        .json({ error: "Registro não encontrado para atualizar." });
    }

    Object.assign(pedido, req.body);

    const resultado = await pedido.atualizar();

    if (resultado.error) {
      return res.status(resultado.status).json({ error: resultado.error });
    }

    return res.status(200).json({
      message: "Registro atualizado com sucesso!",
      data: resultado.data,
    });
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    return res.status(500).json({ error: "Erro ao atualizar registro." });
  }
};

export const deletar = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const pedido = await pedidoModel.buscarPorId(parseInt(id));

    if (!pedido) {
      return res
        .status(404)
        .json({ error: "Registro não encontrado para deletar." });
    }

    const resultado = await pedido.deletar();

    if (resultado.error) {
      return res.status(resultado.status).json({ error: resultado.error });
    }

    return res.status(200).json({
      message: `O registro ID: "${id}" foi deletado com sucesso!`,
      deletado: pedido,
    });
  } catch (error) {
    console.error("Erro ao deletar:", error);
    return res.status(500).json({ error: "Erro ao deletar registro." });
  }
};