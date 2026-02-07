
export const APP_NAME = "Newton";

export const GEMINI_MODELS = {
  LIVE: 'gemini-2.5-flash-native-audio-preview-12-2025',
  FLASH: 'gemini-3-flash-preview',
};

export const MOCK_COURSES = [
  {
    id: 'c1',
    title: 'Mécanique Quantique I',
    description: 'Une introduction aux principes fondamentaux de la physique quantique, la dualité onde-particule et le principe d\'incertitude.',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
    instructor: 'Dr. R. Feynman',
    students: 0,
    modules: 12,
    tags: ['Quantique', 'Physique', 'Avancé']
  },
  {
    id: 'c2',
    title: 'Dynamique Classique',
    description: 'Maîtriser les lois de Newton, la mécanique lagrangienne et le mouvement dans les référentiels non inertiels.',
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop',
    instructor: 'Dr. I. Newton',
    students: 0,
    modules: 8,
    tags: ['Mécanique', 'Maths', 'Fondamental']
  },
  {
    id: 'c3',
    title: 'Électromagnétisme',
    description: 'Les équations de Maxwell, l\'électrostatique, la magnétostatique et les ondes électromagnétiques.',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    instructor: 'Dr. J. Maxwell',
    students: 0,
    modules: 15,
    tags: ['Champs', 'Énergie', 'Ondes']
  }
];

export const MOCK_RESOURCES = [
  { id: 'r1', title: 'Syllabus du Cours - Physique 101', type: 'PDF', date: '2024-03-10', size: '2.4 MB' },
  { id: 'r2', title: 'Exercices: Les Lois de Kepler', type: 'PDF', date: '2024-03-12', size: '1.1 MB' },
  { id: 'r3', title: 'Guide de Laboratoire: Optique', type: 'PDF', date: '2024-03-15', size: '4.5 MB' }
];
