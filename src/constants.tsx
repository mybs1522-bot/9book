import React from 'react';
import { Course, Feature, Testimonial, FaqItem, PricingPlan } from './types';
import { Download, BookOpen, Infinity, LifeBuoy, Users } from 'lucide-react';

/* 
  -----------------------------------------------------------------------
  DATA SOURCE: KITCHEN DESIGN BOOK
  -----------------------------------------------------------------------
*/

const getDriveUrl = (id: string) => `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;

const RAW_BOOKS: Course[] = [
  {
    id: 'kitchen',
    title: 'Kitchen Design Book',
    software: 'Comprehensive Guide',
    description: 'Function meets envy. We go deep on the "Working Triangle," cabinet finishes that don\'t date, and island dimensions that allow flow.',
    imageUrl: 'https://d1yei2z3i6k35z.cloudfront.net/13138299/685712e3dfc75_Your-Numbered-Points-Title-Comes-Right-Here1.jpg',
    color: 'from-slate-600 to-slate-400',
    students: '10.2k',
    learningPoints: [
      'The Golden Triangle rule explained',
      'Materials that survive red wine spills',
      'Hidden storage hacks for small spaces'
    ],
    workflowImpact: 'Design kitchens that people actually want to cook in, not just look at.'
  }
];

export const COURSES = RAW_BOOKS;

export const ROWS = [
  {
    title: "Kitchen Mastery",
    courses: [
      COURSES[0]
    ]
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'lifetime-basic',
    duration: 'The Digital eBook',
    period: 'One-time payment',
    price: '$9',
    originalPrice: '$29',
    label: 'BEST SELLER',
    features: ['Kitchen Design eBook (PDF)', 'Mobile Optimized', 'Interactive Diagrams', 'Instant Download', 'Lifetime Updates'],
    accentColor: 'border-brand-success shadow-glow-success'
  }
];

export const FEATURES: Feature[] = [
  {
    icon: <Download className="w-8 h-8" />,
    title: 'Instant PDF Download',
    description: 'Get the files immediately after purchase. No shipping, no waiting.',
  },
  {
    icon: <Infinity className="w-8 h-8" />,
    title: 'Lifetime Updates',
    description: 'If I update a chapter or add a trend, you get the new file for free.',
  },
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: 'Comprehensive Guide',
    description: 'Zero fluff. Just actionable kitchen design theory, dimensions, and guides.',
  },
  {
    icon: <LifeBuoy className="w-8 h-8" />,
    title: 'Design Support',
    description: 'Reply to your purchase email with questions. I actually answer.',
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Reader Community',
    description: 'Join 50k+ other designers in our monthly newsletter.',
  }
];

export const TESTIMONIALS: Testimonial[] = [
  { name: 'Sarah Miller', role: 'Homeowner', location: 'Austin, TX', verified: true, content: 'I redesigned my entire kitchen using just this book. The rules alone saved me from buying cabinets that would have been completely wrong.' },
  { name: 'David Smith', role: 'DIY Enthusiast', location: 'Sydney, Australia', verified: true, content: 'The step-by-step guides for kitchen layouts are incredible. I saved $15k doing it myself instead of hiring a designer.' },
  { name: 'Olivia Garcia', role: 'Interior Designer', location: 'Madrid, Spain', verified: true, content: 'Even as a pro, I keep this book as a reference. The kitchen clearance charts are the most comprehensive I have ever found.' },
  { name: 'Amelia Lewis', role: 'DIY Renovator', location: 'Denver, CO', verified: true, content: 'The material selection guides saved me from making several expensive mistakes at the tile shop.' }
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Can't I just learn this from YouTube for free?",
    answer: "Sure, you can find scattered tips. But nobody teaches the complete system. This book gives you complete clearances, dimensions, materials, and layouts for kitchens—all in one place."
  },
  {
    question: "Do I need a design background to understand this?",
    answer: "Not at all. This is written for complete beginners. Every concept has handmade diagrams, exact dimensions, and real examples. If you can read, you can use this."
  },
  {
    question: "Will this work for modern homes and apartments?",
    answer: "Yes. It covers standard home sizes, modern layouts, and space optimization for contemporary living. Whether you're in a 500 sqft apartment or a massive home—it's all here."
  },
  {
    question: "What if the content gets outdated?",
    answer: "You get free lifetime updates. When we add new content or update dimensions, you get the new version at no extra cost. Buy once, benefit forever."
  },
  {
    question: "Can I use this for client projects?",
    answer: "Absolutely. Kitchen designers, developers, and consultants use this as their reference manual. The clearance charts work for all levels of professional work."
  }
];

/* 
  -----------------------------------------------------------------------
  INTERIOR DESIGN SYSTEM DATA
  -----------------------------------------------------------------------
*/

export interface Module {
  id: string;
  title: string;
  description: string;
  items: string[];
  icon: string;
}

export const INDUSTRIES = [
  { label: 'Homeowners', icon: 'Home' },
  { label: 'Architecture Students', icon: 'BookOpen' },
  { label: 'Interior Designers', icon: 'Palette' },
  { label: 'Real Estate Developers', icon: 'Building' },
  { label: 'Renovators', icon: 'Hammer' },
  { label: 'DIY Enthusiasts', icon: 'Wrench' }
];

export const MODULES: Module[] = [
  {
    id: 'kitchen-layout',
    title: 'Kitchen Engineering',
    description: 'The working triangle, cabinet science, pantry planning, and countertop dimensions that make kitchens functional.',
    items: ['Working Triangle', 'Cabinet Planning', 'Storage Systems'],
    icon: 'ChefHat'
  },
  {
    id: 'appliances',
    title: 'Appliance Integration',
    description: 'How to perfectly place refrigerators, ovens, and dishwashers without crowding your space.',
    items: ['Clearance Zones', 'Ventilation', 'Electrical Planning'],
    icon: 'Layers'
  },
  {
    id: 'lighting',
    title: 'Lighting & Finishes',
    description: 'Combining task, ambient, and accent lighting while picking durable materials.',
    items: ['Task Lighting', 'Material Selection', 'Color Combinations'],
    icon: 'Bath'
  }
];

export const BUSINESS_MODULES = [
  {
    title: 'Design the Perfect Kitchen',
    description: 'Apply professional design principles to transform your kitchen. Clearances, layouts, and materials explained step-by-step.',
    icon: 'Home'
  },
  {
    title: 'Level Up Your Practice',
    description: 'Use these frameworks as your reference library. Serve clients with confidence using tried-and-tested kitchen systems.',
    icon: 'Briefcase'
  },
  {
    title: 'Save on Costly Mistakes',
    description: 'One wrong cabinet measurement costs thousands. Use exact dimensions to guarantee your kitchen functions perfectly.',
    icon: 'TrendingUp'
  }
];