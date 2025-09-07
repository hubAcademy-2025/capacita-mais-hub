import { User, Trail, Class, Enrollment, Meeting, Notification } from '@/types';

export const users: User[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@capacitamais.com',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@capacitamais.com',
    role: 'professor',
  },
  {
    id: '3',
    name: 'Marina Santos',
    email: 'marina.santos@capacitamais.com',
    role: 'professor',
  },
  {
    id: '4',
    name: 'João Pedro',
    email: 'joao.pedro@email.com',
    role: 'aluno',
  },
  {
    id: '5',
    name: 'Fernanda Costa',
    email: 'fernanda.costa@email.com',
    role: 'aluno',
  },
  {
    id: '6',
    name: 'Roberto Lima',
    email: 'roberto.lima@email.com',
    role: 'aluno',
  },
  {
    id: '7',
    name: 'Juliana Ferreira',
    email: 'juliana.ferreira@email.com',
    role: 'aluno',
  },
];

export const trails: Trail[] = [
  {
    id: '1',
    title: 'Desenvolvimento Web Moderno',
    description: 'Aprenda React, TypeScript e as melhores práticas de desenvolvimento web.',
    duration: '40 horas',
    level: 'Intermediário',
    modules: [
      {
        id: '1',
        title: 'Fundamentos do React',
        description: 'Conceitos básicos e hooks essenciais',
        order: 1,
        content: [
          {
            id: '1',
            title: 'Introdução ao React',
            type: 'video',
            duration: '45 min',
            description: 'Conceitos fundamentais do React'
          },
          {
            id: '2',
            title: 'Components e Props',
            type: 'video',
            duration: '60 min',
            description: 'Como criar e usar componentes'
          },
          {
            id: '3',
            title: 'Quiz: Conceitos Básicos',
            type: 'quiz',
            description: 'Teste seus conhecimentos'
          }
        ]
      },
      {
        id: '2',
        title: 'TypeScript Essencial',
        description: 'Tipagem estática para JavaScript',
        order: 2,
        content: [
          {
            id: '4',
            title: 'Tipos Básicos',
            type: 'video',
            duration: '50 min',
            description: 'string, number, boolean e mais'
          },
          {
            id: '5',
            title: 'Interfaces e Types',
            type: 'video',
            duration: '40 min',
            description: 'Estruturas de dados tipadas'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Liderança e Gestão de Equipes',
    description: 'Desenvolva habilidades de liderança e gestão de pessoas.',
    duration: '30 horas',
    level: 'Intermediário',
    modules: [
      {
        id: '3',
        title: 'Fundamentos da Liderança',
        description: 'Princípios básicos de liderança eficaz',
        order: 1,
        content: [
          {
            id: '6',
            title: 'O que é Liderança?',
            type: 'video',
            duration: '35 min',
            description: 'Conceitos e estilos de liderança'
          },
          {
            id: '7',
            title: 'Comunicação Assertiva',
            type: 'pdf',
            description: 'Material de apoio sobre comunicação'
          }
        ]
      }
    ]
  }
];

export const classes: Class[] = [
  {
    id: '1',
    name: 'Turma React Avançado 2024',
    professorId: '2',
    trailId: '1',
    studentIds: ['4', '5', '6'],
    createdAt: '2024-01-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Liderança para Gestores',
    professorId: '3',
    trailId: '2',
    studentIds: ['7'],
    createdAt: '2024-02-01',
    status: 'active'
  }
];

export const enrollments: Enrollment[] = [
  {
    studentId: '4',
    classId: '1',
    progress: 65,
    completedContent: ['1', '2'],
    enrolledAt: '2024-01-16'
  },
  {
    studentId: '5',
    classId: '1',
    progress: 80,
    finalGrade: 8.5,
    completedContent: ['1', '2', '3', '4'],
    enrolledAt: '2024-01-16'
  },
  {
    studentId: '6',
    classId: '1',
    progress: 45,
    completedContent: ['1'],
    enrolledAt: '2024-01-18'
  },
  {
    studentId: '7',
    classId: '2',
    progress: 30,
    completedContent: ['6'],
    enrolledAt: '2024-02-02'
  }
];

export const meetings: Meeting[] = [
  {
    id: '1',
    classId: '1',
    title: 'Aula Prática: Hooks Avançados',
    dateTime: '2024-03-15T14:00:00',
    duration: 120,
    description: 'Implementação prática de useReducer e useContext',
    status: 'scheduled'
  },
  {
    id: '2',
    classId: '1',
    title: 'Review e Dúvidas',
    dateTime: '2024-03-20T16:00:00',
    duration: 90,
    description: 'Sessão para tirar dúvidas e revisar conceitos',
    status: 'scheduled'
  },
  {
    id: '3',
    classId: '2',
    title: 'Workshop: Comunicação Assertiva',
    dateTime: '2024-03-18T10:00:00',
    duration: 180,
    description: 'Prática de técnicas de comunicação',
    status: 'scheduled'
  }
];

export const notifications: Notification[] = [
  {
    id: '1',
    userId: '4',
    title: 'Nova aula agendada',
    message: 'Aula prática de Hooks Avançados agendada para 15/03 às 14h',
    type: 'info',
    isRead: false,
    createdAt: '2024-03-10T09:00:00'
  },
  {
    id: '2',
    userId: '5',
    title: 'Nota publicada',
    message: 'Sua nota do Quiz: Conceitos Básicos foi publicada: 8.5',
    type: 'success',
    isRead: false,
    createdAt: '2024-03-09T15:30:00'
  },
  {
    id: '3',
    userId: '2',
    title: 'Novo aluno na turma',
    message: 'Roberto Lima se inscreveu na turma React Avançado 2024',
    type: 'info',
    isRead: true,
    createdAt: '2024-03-08T11:20:00'
  }
];