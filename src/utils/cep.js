export const buscarEnderecoPorCep = async (cep) => {
    try {
        let response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

        if (response.ok) {
            const data = await response.json();
            if (!data.erro) {
                return {
                    logradouro: data.logradouro,
                    bairro: data.bairro,
                    localidade: data.localidade,
                    uf: data.uf,
                };
            }
        }
        response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);

        if (response.ok) {
            const data = await response.json();
            return {
                logradouro: data.street,
                bairro: data.neighborhood,
                localidade: data.city,
                uf: data.state,
            };
        }

        return null;
    } catch (error) {
        return null;
    }
};

export const buscarCidadePorCep = async (cep) => {
    const endereco = await buscarEnderecoPorCep(cep);
    if (!endereco) return null;
    return endereco.localidade || endereco.city || null;
};
