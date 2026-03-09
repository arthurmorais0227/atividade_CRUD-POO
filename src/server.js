import express from 'express';
import 'dotenv/config';
import clienteRoutes from './routes/clienteRoute.js';
import pedidoRoutes from './routes/pedidoRoute.js';
import itensPedidoRoutes from './routes/itensPedidoRoute.js';
import produtoRoutes from './routes/produtosRoute.js';
import autenticarApiKey from '../src/utils/apiKey.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🚀 API funcionando');
});

// Rotas
app.use('/api', autenticarApiKey, clienteRoutes);
app.use('/api', pedidoRoutes);
app.use('/api', itensPedidoRoutes);
app.use('/api', produtoRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
