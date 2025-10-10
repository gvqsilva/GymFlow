// constants/metData.ts

interface ActivityMETs {
    [intensity: string]: number;
}

// NOVO: Valores MET padrão para desportos não listados
export const DEFAULT_MET_VALUES = {
    Leve: 3.0,     // Equivalente a uma caminhada leve
    Moderada: 4.5,  // Equivalente a uma caminhada moderada/rápida
    Alta: 7.0,      // Equivalente a um jogging leve ou ténis casual
};

export const MET_DATA: { [activity: string]: ActivityMETs } = {
    'Academia': {
        'Leve': 3.5,
        'Moderada': 5.0,
        'Alta': 6.0, // Treino de força vigoroso
    },
    'Vôlei de Quadra': {
        'Leve': 3.0, // Amigável, não competitivo
        'Moderada': 6.0, // Competitivo
        'Alta': 8.0, // Jogo intenso
    },
    'Vôlei de Praia': {
        'Leve': 4.0,
        'Moderada': 8.0,
        'Alta': 8.0, // Já é naturalmente intenso
    },
    'Futebol Society': {
        'Leve': 5.0, // Amigável
        'Moderada': 8.0,
        'Alta': 10.0, // Jogo competitivo
    },
    'Boxe': {
        'Leve': 5.5, // Treino de saco, leve
        'Moderada': 8.0, // Circuito geral (pular corda, abdominais, etc.)
        'Alta': 10.0, // Circuito de alta intensidade, com pouco descanso
    },
};

