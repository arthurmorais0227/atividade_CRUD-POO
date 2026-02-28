import clienteModel from "../models/clienteModel.js";

export const criar = async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ error: "Corpo da requisição vazio. Envie os dados!" });
    }

    const {
      nome,
      telefone,
      email,
      cpf,
      cep,
      logradouro,
      bairro,
      localidade,
      uf,
    } = req.body;

    if (!nome)
      return res.status(400).json({ error: 'O campo "nome" é obrigatório!' });
    if (!telefone)
      return res
        .status(400)
        .json({ error: 'O campo "telefone" é obrigatório!' });
    if (!email)
      return res.status(400).json({ error: 'O campo "email" é obrigatório!' });
    if (!cpf)
      return res.status(400).json({ error: 'O campo "cpf" é obrigatório!' });
    if (!cep)
      return res.status(400).json({ error: 'O campo "cep" é obrigatório!' });
    if (!logradouro)
      return res
        .status(400)
        .json({ error: 'O campo "logradouro" é obrigatório!' });
    if (!bairro)
      return res.status(400).json({ error: 'O campo "bairro" é obrigatório!' });
    if (!localidade)
      return res
        .status(400)
        .json({ error: 'O campo "localidade" é obrigatório!' });
    if (!uf)
      return res.status(400).json({ error: 'O campo "uf" é obrigatório!' });

    const cliente = new clienteModel({
      nome,
      telefone,
      email,
      cpf,
      cep,
      logradouro,
      bairro,
      localidade,
      uf,
    });
    const data = await cliente.criar();

    res.status(201).json({ message: "Registro criado com sucesso!", data });
  } catch (error) {
    console.error("Erro ao criar:", error);
    res.status(500).json({ error: "Erro interno ao salvar o registro." });
  }
};

export const buscarTodos = async (req, res) => {
  try {
    const registros = await clienteModel.buscarTodos(req.query);

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

    const cliente = await clienteModel.buscarPorId(parseInt(id));

    if (!cliente) {
      return res.status(404).json({ error: "Registro não encontrado." });
    }

    res.json({ data: cliente });
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

    const cliente = await clienteModel.buscarPorId(parseInt(id));

    if (!cliente) {
      return res
        .status(404)
        .json({ error: "Registro não encontrado para atualizar." });
    }

    Object.assign(cliente, req.body);

    const resultado = await cliente.atualizar();

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

    const cliente = await clienteModel.buscarPorId(parseInt(id));

    if (!cliente) {
      return res
        .status(404)
        .json({ error: "Registro não encontrado para deletar." });
    }

    const resultado = await cliente.deletar();

    if (resultado.error) {
      return res.status(resultado.status).json({ error: resultado.error });
    }

    return res.status(200).json({
      message: `O registro "${cliente.nome}" foi deletado com sucesso!`,
      deletado: cliente,
    });
  } catch (error) {
    console.error("Erro ao deletar:", error);
    return res.status(500).json({ error: "Erro ao deletar registro." });
  }
};
