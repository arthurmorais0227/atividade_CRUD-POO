import ProdutoModel from "../models/produtosModel.js";

export const criar = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Corpo de requisição vazio' });
        }

        const { nome, descricao, categoria, preco, disponivel } = req.body;

        
        if (!nome) return res.status(400).json({ error: 'O campo "nome" é obrigatório' });
        if (!categoria) return res.status(400).json({ error: 'O campo "categoria" é obrigatório' });
        if (preco === undefined)
            return res.status(400).json({ error: 'O campo "preço" é obrigatório' });

        const produto = new ProdutoModel({ nome, descricao, categoria, preco, disponivel });
        const resultado = await produto.criar();

        if (resultado.error) return res.status(resultado.status).json({ error: resultado.error });

        res.status(201).json({ message: 'Produto criado com sucesso!', data: resultado });
    } catch (error) {
        res.status(500).json({ error: "Erro interno ao salvar o produto."})
    }
};


export const buscarTodos = async (req, res) => {
    try {
        const registros = await ProdutoModel.buscarTodos(req.query);
        if (!registros || registros.length === 0) {
            return res.status(200).json({ message: "Nenhum produto encontrado"});
        }

        res.json(registros);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar produto"});
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) return res.status(400).json({ error: "ID invalido"});

        const produto = await ProdutoModel.buscarPorId(parseInt(id));
        if (!produto) return res.status(404).json({ error: "Registro não encontrado"});

        res.json({ data: produto});
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar registro"});
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) return res.status(400).json({ error: "ID inválido"});

        const produto = await ProdutoModel.buscarPorId(parseInt(id));
        if (!produto) return res.status(404).json({ error: "Registro não encontrado"});

        Object.assign(produto, req.body);
        const resultado = await produto.atualizar();

        if(resultado.error) return res.status(resultado.status).json({ error: resultado.error});

        res.status(200).json({message: "Registro atualizado com sucesso!", data: resultado.data});
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualiar registro"});
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) return res.status(400).json({ error: "ID invalido"});

        const produto = await ProdutoModel.buscarPorId(parseInt(id));
        if (!produto) return res.status(404).json({ error: "Registro não encontrado."});


        const resultado = await produto.deletar();
        if (resultado.error) return res.status(resultado.status).json({error: resultado.error});

        res.status(200).json({ message: `O registro "${produto.nome}" foi deletado!`});
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar registro."})
    }
};
