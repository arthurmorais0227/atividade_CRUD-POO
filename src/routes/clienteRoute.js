import express from 'express';
import * as controller from '../controllers/clienteController.js';
import autenticarApiKey from '../utils/apiKey.js';

const router = express.Router();

router.post('/clientes', controller.criar);
router.get('/clientes', autenticarApiKey, controller.buscarTodos);
router.get('/clientes/:id', controller.buscarPorId);
router.get('/clientes/:id/clima', controller.obterClimaCliente);
router.put('/clientes/:id', controller.atualizar);
router.delete('/clientes/:id', controller.deletar);

export default router;
