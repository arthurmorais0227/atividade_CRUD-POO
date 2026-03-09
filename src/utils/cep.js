export const buscarEnderecoPorCep = async (cep) => {
    const cepLimpo = cep.replace('-', '');
    if (!/^\d{8}$/.test(cepLimpo)) {
        throw new Error('CEP deve conter exatamente 8 dígitos numéricos.');
    }

    try {
        let response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

        if (response.ok) {
            const data = await response.json();
            if (!data.erro) {
                return {
                    logradouro: data.logradouro,
                    bairro: data.bairro,
                    localidade: data.localidade,
                    uf: data.uf,
                };
            } else {
                throw new Error('CEP não encontrado.');
            }
        } else {
            throw new Error('Serviço ViaCEP indisponível no momento.');
        }
    } catch (error) {
        // try BrasilAPI
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cepLimpo}`);

            if (response.ok) {
                const data = await response.json();
                return {
                    logradouro: data.street,
                    bairro: data.neighborhood,
                    localidade: data.city,
                    uf: data.state,
                };
            } else {
                throw new Error('CEP não encontrado.');
            }
        } catch (innerError) {
            throw new Error('Serviço ViaCEP indisponível no momento.');
        }
    }
};

export const buscarCidadePorCep = async (cep) => {
    const endereco = await buscarEnderecoPorCep(cep);
    if (!endereco) return null;
    return endereco.localidade || endereco.city || null;
};
