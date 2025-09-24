// constants/workoutData.ts

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  series: number;
  reps: string;
  obs: string;
  gifUrl: string;
}

export interface Workout {
  id: string;
  name: string;
  groups: string;
  exercises: Exercise[];
}

export const WORKOUT_DATA: Record<string, Workout> = {
  A: {
    id: 'A',
    name: 'Treino A',
    groups: 'Peito/Ombro/Tríceps ',
    exercises: [
      {
        id: 'A1',
        name: 'Supino Inclinado com halteres',
        muscle: 'Peitoral',
        series: 4,
        reps: '12/10/10/8',
        obs: 'Banco 45°',
        gifUrl: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/supino-inclinado-com-halteres.gif', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'A2',
        name: 'Supino Reto com halteres',
        muscle: 'Peitoral',
        series: 3,
        reps: '12/10/8',
        obs: 'Banco 30°',
        gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2020/06/dumbbell-bench-press.gif', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'A3',
        name: 'Supino Articulado Declinado',
        muscle: 'Peitoral',
        series: 4,
        reps: '12/10/10/8',
        obs: '',
        gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2018/09/lever-decline-chest-press.gif', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'A4',
        name: 'Crucifixo Máquina',
        muscle: 'Peitoral',
        series: 3,
        reps: '12/10/8',
        obs: '',
        gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/09/lever-seated-fly.gif', // SUBSTITUA PELO SEU GIF
      },
       {
        id: 'A5',
        name: 'Desenvolvimento Máquina',
        muscle: 'Ombro',
        series: 4,
        reps: '12/10/10/8',
        obs: '',
        gifUrl: 'https://media.tenor.com/vFJSvh8AvhAAAAAM/a1.gif', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'A6',
        name: 'Elevação Lateral com Halter',
        muscle: 'Ombro',
        series: 3,
        reps: '12/10/8',
        obs: '',
        gifUrl: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/ombros-elevacao-lateral-de-ombros-com-halteres.gif', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'A7',
        name: 'Tríceps Testa W',
        muscle: 'Tríceps',
        series: 3,
        reps: '12/10/8',
        obs: 'Barra W',
        gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/02/barbell-lying-triceps-extension-skull-crusher.gif', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'A8',
        name: 'Tríceps Frânces com Halter',
        muscle: 'Tríceps',
        series: 3,
        reps: '12/10/8',
        obs: '',
        gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2025/01/triceps-frances-com-um-halter-sentado.gif', // SUBSTITUA PELO SEU GIF
      },
    ],
  },
  B: {
    id: 'B',
    name: 'Treino B',
    groups: 'Costas/Bíceps ',
    exercises: [
       {
        id: 'B1',
        name: 'Puxada Anterior',
        muscle: 'Dorsal',
        series: 4,
        reps: '12/10/8/6',
        obs: 'Mapfit 1',
        gifUrl: 'https://static.wixstatic.com/media/2edbed_f174c44ab99c4ddfbac6867900ef849e~mv2.gif', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'B2',
        name: 'Remada Unilateral Halter',
        muscle: 'Dorsal',
        series: 4,
        reps: '12/10/8/6',
        obs: '"Serrote"',
        gifUrl: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/costas-remada-unilateral-com-halter-serrote-no-banco.gif', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'B3',
        name: 'Remada Maquina Aberta',
        muscle: 'Dorsal',
        series: 3,
        reps: '12/10/8',
        obs: '',
        gifUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtYjYInP2FtyerpE6XKOjr-0poe7hrk21F_Q&s', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'B4',
        name: 'Extensão Lombar 45°',
        muscle: 'Dorsal',
        series: 3,
        reps: '12/10/8',
        obs: '',
        gifUrl: 'https://static.wixstatic.com/media/00b9a7_ad5de5c675cd42afb8738a74fc6da6f4~mv2.gif', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'B5',
        name: 'Remada Alta Polia Baixa',
        muscle: 'Trapézio',
        series: 4,
        reps: '12/10/10/8',
        obs: '',
        gifUrl: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/ombros-remada-alta-no-cabo.gif', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'B6',
        name: 'Rosca Halters',
        muscle: 'Biceps',
        series: 3,
        reps: '12/10/8',
        obs: 'Banco 45°',
        gifUrl: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/rosca-biceps-com-halteres-no-banco-inclinado.gif', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'B7',
        name: 'Rosca Martelo',
        muscle: 'Biceps',
        series: 3,
        reps: '12/10/8',
        obs: 'Cross Corda',
        gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/08/cable-hammer-curl-with-rope.gif', // SUBSTITUA PELO SEU GIF
      },
    ],
  },
  C: {
    id: 'C',
    name: 'Treino C',
    groups: 'Perna completo ',
    exercises: [
      {
        id: 'C1',
        name: 'Gemeos em Pé',
        muscle: 'Inferiores',
        series: 4,
        reps: '12/10/10/8',
        obs: 'Maquina',
        gifUrl: 'https://www.mundoboaforma.com.br/wp-content/uploads/2021/03/Panturrilha-em-pe-no-aparelho.gif', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'C2',
        name: 'Agachamento Smith',
        muscle: 'Inferiores',
        series: 4,
        reps: '12/10/10/8',
        obs: '',
        gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2017/11/smith-full-squat.gif', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'C3',
        name: 'Leg Press Horizontal',
        muscle: 'Inferiores',
        series: 3,
        reps: '8',
        obs: 'Unilateral',
        gifUrl: 'https://gymvisual.com/img/p/1/4/5/9/2/14592.gif', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'C4',
        name: 'Cadeira Extensora',
        muscle: 'Inferiores',
        series: 4,
        reps: '11/10/8/6',
        obs: '',
        gifUrl: 'https://karoldeliberato.com.br/wp-content/uploads/2023/04/image4-1.gif', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'C5',
        name: 'Mesa Flexora',
        muscle: 'Inferiores',
        series: 3,
        reps: '12/10/8',
        obs: '',
        gifUrl: 'https://image.tuasaude.com/media/article/hz/mb/mesa-flexora_75623.gif?width=686&height=487', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'C6',
        name: 'Cadeira Flexora',
        muscle: 'Inferiores',
        series: 4,
        reps: '12/10/8/6',
        obs: '',
        gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/12/cadeira-flexora.gif', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'C7',
        name: 'Cadeira Abdutora',
        muscle: 'Gluteos',
        series: 4,
        reps: '12/10/10/8',
        obs: '',
        gifUrl: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/09/lever-seated-hip-abduction.gif', // SUBSTITUA PELO SEU GIF
      },
      {
        id: 'C8',
        name: 'Cadeira Adutora',
        muscle: 'Gluteos',
        series: 4,
        reps: '12/10/10/8',
        obs: '',
        gifUrl: 'https://grandeatleta.com.br/wp-content/uploads/2018/05/cadeira-adutora-execucao.gif', // SUBSTITUA PELO SEU GIF
      },
    ],
  },
};