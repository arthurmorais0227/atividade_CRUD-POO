import express from 'express';
import * as controller from '../controllers/pedidoController.js';

const router = express.Router();

router.post('/pedidos', controller.criar);
router.get('/pedidos', controller.buscarTodos);
router.get('/pedidos/:id', controller.buscarPorId);
router.put('/pedidos/:id', controller.atualizar);
router.put('/pedidos/:id/cancelar', controller.cancelar);
router.post('/pedidos/:id/itens', controller.adicionarItem);
router.delete('/pedidos/:id/itens/:itemId', controller.removerItem);
router.delete('/pedidos/:id', controller.deletar);

export default router;
