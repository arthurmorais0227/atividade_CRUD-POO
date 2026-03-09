import itemPedidoModel from '../models/itensPedidoModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { pedidoId, produtoId, quantidade } = req.body;

        if (!pedidoId)
            return res.status(400).json({
                error: 'O campo "pedidoId" é obrigatório!',
            });

        if (!produtoId)
            return res.status(400).json({
                error: 'O campo "produtoId" é obrigatório!',
            });

        if (quantidade === undefined)
            return res.status(400).json({
                error: 'O campo "quantidade" é obrigatório!',
            });

        if (quantidade <= 0)
            return res.status(400).json({
                error: 'Quantidade deve ser maior que 0!',
            });

        const item = new itemPedidoModel({
            pedidoId,
            produtoId,
            quantidade,
        });

        const data = await item.criar();

        res.status(201).json({
            message: 'Item criado com sucesso!',
            data,
        });
    } catch (error) {
        console.error('Erro ao criar item:', error);

        res.status(500).json({
            error: error.message || 'Erro interno ao salvar o item.',
        });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await itemPedidoModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({
                message: 'Nenhum item encontrado.',
            });
        }

        res.json(registros);
    } catch (error) {
        console.error('Erro ao buscar itens:', error);

        res.status(500).json({
            error: 'Erro ao buscar itens.',
        });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({
                error: 'O ID enviado não é um número válido.',
            });
        }

        const item = await itemPedidoModel.buscarPorId(parseInt(id));

        if (!item) {
            return res.status(404).json({
                error: 'Item não encontrado.',
            });
        }

        res.json({
            data: item,
        });
    } catch (error) {
        console.error('Erro ao buscar item:', error);

        res.status(500).json({
            error: 'Erro ao buscar item.',
        });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({
                error: 'ID inválido.',
            });
        }

        const item = await itemPedidoModel.buscarPorId(parseInt(id));

        if (!item) {
            return res.status(404).json({
                error: 'Item não encontrado para atualizar.',
            });
        }

        Object.assign(item, req.body);

        const resultado = await item.atualizar();

        if (resultado.error) {
            return res.status(resultado.status).json({
                error: resultado.error,
            });
        }

        return res.status(200).json({
            message: 'Item atualizado com sucesso!',
            data: resultado.data,
        });
    } catch (error) {
        console.error('Erro ao atualizar item:', error);

        return res.status(500).json({
            error: 'Erro ao atualizar item.',
        });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({
                error: 'ID inválido.',
            });
        }

        const item = await itemPedidoModel.buscarPorId(parseInt(id));

        if (!item) {
            return res.status(404).json({
                error: 'Item não encontrado para deletar.',
            });
        }

        const resultado = await item.deletar();

        if (resultado.error) {
            return res.status(resultado.status).json({
                error: resultado.error,
            });
        }

        return res.status(200).json({
            message: `O item ID: "${id}" foi deletado com sucesso!`,
            deletado: item,
        });
    } catch (error) {
        console.error('Erro ao deletar item:', error);

        return res.status(500).json({
            error: 'Erro ao deletar item.',
        });
    }
};
