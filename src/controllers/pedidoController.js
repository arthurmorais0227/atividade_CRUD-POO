import pedidoModel from '../models/pedidoModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { clienteId, total, status, itens } = req.body;

        if (!clienteId)
            return res.status(400).json({ error: 'O campo "clienteId" é obrigatório!' });
        if (total === undefined)
            return res.status(400).json({ error: 'O campo "total" é obrigatório!' });
        if (!status) return res.status(400).json({ error: 'O campo "status" é obrigatório!' });
        if (!itens || !Array.isArray(itens) || itens.length === 0)
            return res
                .status(400)
                .json({ error: 'O pedido deve conter pelo menos um item no campo "itens"!' });

        const pedido = new pedidoModel({
            clienteId,
            total,
            status,
            itens,
        });

        const data = await pedido.criar();

        if (data && data.error) {
            // modelo retornou um objeto de erro
            return res.status(data.status || 400).json({ error: data.error });
        }

        res.status(201).json({ message: 'Registro criado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao criar:', error);
        res.status(500).json({ error: 'Erro interno ao salvar o registro.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await pedidoModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({ message: 'Nenhum registro encontrado.' });
        }

        res.json(registros);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar registros.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const pedido = await pedidoModel.buscarPorId(parseInt(id));

        if (!pedido) {
            return res.status(404).json({ error: 'Registro não encontrado.' });
        }

        res.json({ data: pedido });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar registro.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const pedido = await pedidoModel.buscarPorId(parseInt(id));

        if (!pedido) {
            return res.status(404).json({ error: 'Registro não encontrado para atualizar.' });
        }

        Object.assign(pedido, req.body);

        const resultado = await pedido.atualizar();

        if (resultado.error) {
            return res.status(resultado.status).json({ error: resultado.error });
        }

        return res.status(200).json({
            message: 'Registro atualizado com sucesso!',
            data: resultado.data,
        });
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        return res.status(500).json({ error: 'Erro ao atualizar registro.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const pedido = await pedidoModel.buscarPorId(parseInt(id));

        if (!pedido) {
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });
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
        console.error('Erro ao deletar:', error);
        return res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
};

export const cancelar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const pedido = await pedidoModel.buscarPorId(parseInt(id));
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }

        if (pedido.status !== 'ABERTO') {
            return res
                .status(400)
                .json({ error: 'Só é possível cancelar pedidos com status ABERTO.' });
        }

        pedido.status = 'CANCELADO';
        const resultado = await pedido.atualizar();

        if (resultado.error) {
            return res.status(resultado.status).json({ error: resultado.error });
        }

        return res.status(200).json({
            message: 'Pedido cancelado com sucesso!',
            data: resultado.data,
        });
    } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
        return res.status(500).json({ error: 'Erro interno ao cancelar pedido.' });
    }
};

export const adicionarItem = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID de pedido inválido.' });
        }

        const pedido = await pedidoModel.buscarPorId(parseInt(id));
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }

        if (pedido.status !== 'ABERTO') {
            return res
                .status(400)
                .json({ error: 'Só é possível adicionar itens a pedidos ABERTOS.' });
        }

        const { produtoId, quantidade } = req.body;
        if (!produtoId)
            return res.status(400).json({ error: 'O campo "produtoId" é obrigatório!' });
        if (quantidade === undefined)
            return res.status(400).json({ error: 'O campo "quantidade" é obrigatório!' });

        // regra de negócio: não adicionar produto indisponível (checa pelo model)

        const ItemPedidoModel = (await import('../models/itensPedidoModel.js')).default;
        const item = new ItemPedidoModel({
            pedidoId: parseInt(id),
            produtoId,
            quantidade,
        });

        const criado = await item.criar();
        return res.status(201).json({ message: 'Item adicionado com sucesso!', data: criado });
    } catch (error) {
        console.error('Erro ao adicionar item:', error);
        return res.status(500).json({ error: error.message || 'Erro interno ao adicionar item.' });
    }
};

export const removerItem = async (req, res) => {
    try {
        const { id, itemId } = req.params;
        if (isNaN(id) || isNaN(itemId)) {
            return res.status(400).json({ error: 'IDs inválidos.' });
        }

        const pedido = await pedidoModel.buscarPorId(parseInt(id));
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }

        if (pedido.status !== 'ABERTO') {
            return res
                .status(400)
                .json({ error: 'Só é possível remover itens de pedidos ABERTOS.' });
        }

        const ItemPedidoModel = (await import('../models/itensPedidoModel.js')).default;
        const item = await ItemPedidoModel.buscarPorId(parseInt(itemId));
        if (!item) {
            return res.status(404).json({ error: 'Item não encontrado.' });
        }

        if (item.pedidoId !== parseInt(id)) {
            return res.status(400).json({ error: 'O item não pertence ao pedido informado.' });
        }

        const resultado = await item.deletar();
        if (resultado.error) {
            return res.status(resultado.status).json({ error: resultado.error });
        }

        return res.status(200).json({ message: 'Item removido com sucesso!' });
    } catch (error) {
        console.error('Erro ao remover item:', error);
        return res.status(500).json({ error: 'Erro interno ao remover item.' });
    }
};
