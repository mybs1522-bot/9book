export interface Course {
  id: string;
  title: string;
  software: string;
  description: string;
  imageUrl: string;
  color: string;
  students: string;
  learningPoints: string[];
  workflowImpact: string;
}

export interface Feature {
  icon: any;
  title: string;
  description: string;
}

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  location: string;
  verified?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PricingPlan {
  id: string;
  duration: string;
  price: string;
  originalPrice?: string;
  period: string;
  label?: string;
  features: string[];
  accentColor: string;
}