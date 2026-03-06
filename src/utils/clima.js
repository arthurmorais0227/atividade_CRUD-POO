import { buscarCidadePorCep } from './cep.js';

const buscarCoordenadas = async (cidade) => {
    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&countryCode=BR`,
        );

        if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const resultado = data.results[0];
                return {
                    latitude: resultado.latitude,
                    longitude: resultado.longitude,
                };
            }
        }

        return null;
    } catch (error) {
        return null;
    }
};

const buscarClimaAtual = async (latitude, longitude) => {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&timezone=America/Sao_Paulo`,
        );

        if (response.ok) {
            const data = await response.json();
            if (data.current) {
                return {
                    temperatura: data.current.temperature_2m,
                    weathercode: data.current.weathercode,
                };
            }
        }

        return null;
    } catch (error) {
        return null;
    }
};

const interpretarWeatherCode = (weathercode) => {
    if (weathercode === 0) return { chove: false, descricao: 'Céu limpo' };
    if ([1, 2].includes(weathercode)) return { chove: false, descricao: 'Parcialmente nublado' };
    if (weathercode === 3) return { chove: false, descricao: 'Nublado' };
    if ([45, 48].includes(weathercode)) return { chove: false, descricao: 'Névoa' };
    if (weathercode >= 51 && weathercode <= 67) return { chove: true, descricao: 'Chuva' };
    if ([80, 81, 82].includes(weathercode)) return { chove: true, descricao: 'Chuva forte' };
    if ([85, 86].includes(weathercode)) return { chove: true, descricao: 'Chuva com neve' };
    if (weathercode >= 95 && weathercode <= 99) return { chove: true, descricao: 'Tempestade' };

    return { chove: false, descricao: 'Desconhecido' };
};

const gerarSugestaoClima = (temperatura, chove) => {
    if (chove) {
        return '🌧 Dia chuvoso! Ofereça promoções para delivery.';
    }
    if (temperatura >= 28) {
        return '🌞 Dia quente! Destaque combos com bebida gelada.';
    }
    if (temperatura <= 18) {
        return '🥶 Dia frio! Destaque cafés e lanches quentes.';
    }
    return '🌤 Clima agradável! Aproveite para divulgar combos da casa.';
};

export const obterClima = async (cep) => {
    if (!cep || !/^\d{8}$/.test(cep.toString().replace('-', ''))) {
        throw new Error('CEP_INVALIDO');
    }

    const cidade = await buscarCidadePorCep(cep);
    if (!cidade) {
        return null;
    }

    const coordenadas = await buscarCoordenadas(cidade);
    if (!coordenadas) {
        return null;
    }

    const clima = await buscarClimaAtual(coordenadas.latitude, coordenadas.longitude);
    if (!clima) {
        return null;
    }

    const { chove, descricao } = interpretarWeatherCode(clima.weathercode);
    const quente = clima.temperatura >= 28;
    const sugestao = gerarSugestaoClima(clima.temperatura, chove, quente);

    return {
        temperatura: clima.temperatura,
        chove,
        quente,
        sugestao,
        cidade,
        descricao,
    };
};
