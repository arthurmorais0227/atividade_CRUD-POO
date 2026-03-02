import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Limpando banco de dados...');
    // A ordem de delete importa por causa das FKs
    await prisma.itemPedido.deleteMany();
    await prisma.pedido.deleteMany();
    await prisma.produto.deleteMany();
    await prisma.cliente.deleteMany();

    console.log('📦 Inserindo Clientes...');
    const clientes = await Promise.all([
        prisma.cliente.create({
            data: {
                nome: 'Ana Silva',
                telefone: '11999999991',
                email: 'ana@email.com',
                cpf: '12345678901',
                cep: '01001000',
                localidade: 'São Paulo',
                uf: 'SP',
            },
        }),
        prisma.cliente.create({
            data: {
                nome: 'Bruno Costa',
                telefone: '11999999992',
                email: 'bruno@email.com',
                cpf: '23456789012',
                cep: '20040002',
                localidade: 'Rio de Janeiro',
                uf: 'RJ',
            },
        }),
        prisma.cliente.create({
            data: {
                nome: 'Carla Dias',
                telefone: '11999999993',
                email: 'carla@email.com',
                cpf: '34567890123',
                cep: '30140000',
                localidade: 'Belo Horizonte',
                uf: 'MG',
            },
        }),
        prisma.cliente.create({
            data: {
                nome: 'Diego Luz',
                telefone: '11999999994',
                email: 'diego@email.com',
                cpf: '45678901234',
                cep: '70040000',
                localidade: 'Brasília',
                uf: 'DF',
            },
        }),
        prisma.cliente.create({
            data: {
                nome: 'Elena Vaz',
                telefone: '11999999995',
                email: 'elena@email.com',
                cpf: '56789012345',
                cep: '90010000',
                localidade: 'Porto Alegre',
                uf: 'RS',
            },
        }),
    ]);

    console.log('📦 Inserindo Produtos...');
    const produtos = await Promise.all([
        prisma.produto.create({
            data: {
                nome: 'Hambúrguer Artesanal',
                descricao: 'Pão brioche e carne 180g',
                categoria: 'LANCHE',
                preco: 35.0,
            },
        }),
        prisma.produto.create({
            data: {
                nome: 'Batata Frita G',
                descricao: 'Batata palito crocante',
                categoria: 'LANCHE',
                preco: 15.0,
            },
        }),
        prisma.produto.create({
            data: {
                nome: 'Refrigerante Lata',
                descricao: '350ml gelado',
                categoria: 'BEBIDA',
                preco: 7.0,
            },
        }),
        prisma.produto.create({
            data: {
                nome: 'Milkshake Chocolate',
                descricao: '500ml com calda',
                categoria: 'SOBREMESA',
                preco: 22.0,
            },
        }),
        prisma.produto.create({
            data: {
                nome: 'Combo Casal',
                descricao: '2 Lanches + 1 Batata + 2 Bebidas',
                categoria: 'COMBO',
                preco: 85.0,
            },
        }),
    ]);

    console.log('📦 Inserindo Pedidos e Itens...');
    // Criando 5 pedidos relacionados aos clientes e produtos criados acima
    for (let i = 0; i < 5; i++) {
        // Calcular o total com base nos itens
        const itens = [
            {
                produtoId: produtos[i].id,
                quantidade: 3,
                precoUnitario: produtos[i].preco,
            },
        ];

        const total = itens.reduce((acc, item) => acc + item.precoUnitario * item.quantidade, 0);

        await prisma.pedido.create({
            data: {
                clienteId: clientes[i].id,
                total, // Agora o total é calculado
                status: 'PAGO',
                itens: {
                    create: itens,
                },
            },
        });
    }

    console.log('✅ Seed concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
