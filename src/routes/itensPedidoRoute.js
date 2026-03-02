import express from 'express';
import * as controller from '../controllers/itensPedidoController.js';

const router = express.Router();

router.post('/itemPedido', controller.criar);
router.get('/itemPedido', controller.buscarTodos);
router.get('/itemPedido/:id', controller.buscarPorId);
router.put('/itemPedido/:id', controller.atualizar);
router.delete('/itemPedido/:id', controller.deletar);

export default router;
