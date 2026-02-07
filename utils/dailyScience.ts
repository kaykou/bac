import { Lightbulb, Sun, Globe, Atom, Droplets, Zap } from 'lucide-react';

export interface ScienceFact {
    icon: any;
    title: string;
    content: string;
    fact: string;
    // Styling for the full page
    color: string;
    bg: string;
    // Styling for the cute button in the navbar
    navBg: string;
    navText: string;
    navBorder: string;
    iconClass: string; // For specific animations like spin-slow
}

export const SCIENCE_FACTS: ScienceFact[] = [
    {
        icon: Globe,
        title: "La Gravité",
        content: "Imaginez l'espace comme un grand drap tendu. Si vous posez une boule de bowling au milieu (le Soleil), le drap se courbe. Si vous lancez une bille (la Terre) sur le drap, elle tournera autour du creux. C'est la courbure de l'espace-temps !",
        fact: "Sur Mars, vous pèseriez seulement 38% de votre poids sur Terre.",
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        navBg: 'bg-blue-100',
        navText: 'text-blue-600',
        navBorder: 'hover:border-blue-300',
        iconClass: 'group-hover:animate-bounce' // Planet bounces
    },
    {
        icon: Sun,
        title: "La Lumière",
        content: "La lumière du soleil contient toutes les couleurs. L'atmosphère diffuse davantage la lumière bleue (onde courte). C'est pour ça que le ciel est bleu ! Au coucher, la lumière traverse plus d'air, ne laissant passer que le rouge.",
        fact: "La lumière du soleil met 8 minutes et 20 secondes pour nous atteindre.",
        color: 'text-yellow-500',
        bg: 'bg-yellow-50',
        navBg: 'bg-yellow-100',
        navText: 'text-yellow-600',
        navBorder: 'hover:border-yellow-300',
        iconClass: 'group-hover:animate-spin-slow' // Sun spins
    },
    {
        icon: Zap,
        title: "L'Électricité",
        content: "C'est une histoire d'électrons ! Dans une ampoule, ils se bousculent dans un filament qui chauffe à blanc. Dans une LED, les électrons sautent des barrières atomiques et libèrent de la lumière pure sans chauffer.",
        fact: "La vitesse de l'électricité est proche de celle de la lumière.",
        color: 'text-purple-500',
        bg: 'bg-purple-50',
        navBg: 'bg-purple-100',
        navText: 'text-purple-600',
        navBorder: 'hover:border-purple-300',
        iconClass: 'group-hover:text-purple-500' // Simple color shift
    },
    {
        icon: Atom,
        title: "L'Atome",
        content: "Tout est fait d'atomes. Mais un atome est composé à 99.99% de vide ! Si on enlevait tout le vide des atomes de tous les humains sur Terre, l'humanité entière tiendrait dans un morceau de sucre.",
        fact: "Les électrons tournent autour du noyau comme des planètes, mais à une vitesse folle.",
        color: 'text-green-500',
        bg: 'bg-green-50',
        navBg: 'bg-emerald-100',
        navText: 'text-emerald-600',
        navBorder: 'hover:border-emerald-300',
        iconClass: 'group-hover:animate-spin' // Atom spins fast
    },
    {
        icon: Droplets,
        title: "L'Eau",
        content: "L'eau mouille grâce à l'adhésion (elle colle aux surfaces) et la cohésion (elle reste ensemble). C'est ce qui lui permet de grimper le long des plantes contre la gravité (capillarité).",
        fact: "L'eau est la seule substance sur Terre existant naturellement sous trois formes : liquide, solide, gaz.",
        color: 'text-cyan-500',
        bg: 'bg-cyan-50',
        navBg: 'bg-cyan-100',
        navText: 'text-cyan-600',
        navBorder: 'hover:border-cyan-300',
        iconClass: 'group-hover:animate-pulse' // Water pulses
    }
];

export const getDailyFact = (): ScienceFact => {
    const today = new Date();
    // Unique index per day of the year
    const dayIndex = (today.getDate() + today.getMonth() * 30) % SCIENCE_FACTS.length;
    return SCIENCE_FACTS[dayIndex];
};