
import React, { useState } from 'react';
import { User, Ruler, Home, Hammer, GraduationCap, CheckCircle2, RefreshCw, MousePointerClick } from 'lucide-react';

type RoleType = 'Designer' | 'Architect' | 'Homeowner' | 'Contractor' | 'Student' | null;

const ROLES = [
  { 
    id: 'Designer', 
    icon: <User size={20} />, 
    label: 'Designer', 
    text: "Stop doubting your layouts. These books give you the technical confidence to charge more and defend your decisions to clients." 
  },
  { 
    id: 'Architect', 
    icon: <Ruler size={20} />, 
    label: 'Architect', 
    text: "Bridge the gap between structure and lifestyle. Get detailed interior dimensions that make your floor plans actually livable." 
  },
  { 
    id: 'Homeowner', 
    icon: <Home size={20} />, 
    label: 'Home Owner', 
    text: "Don't hire a designer for $5,000. Save your budget and learn the rules to make your home look expensive on your own." 
  },
  { 
    id: 'Contractor', 
    icon: <Hammer size={20} />, 
    label: 'Contractor', 
    text: "Avoid change orders. Understand *why* the designer drew it that way, or spot mistakes before you frame the wall." 
  },
  { 
    id: 'Student', 
    icon: <GraduationCap size={20} />, 
    label: 'Student', 
    text: "They don't teach this in school. Learn real-world dimensions, standard clearances, and practical workflows to get you hired." 
  },
];

export const RoleSelector: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<RoleType>(null);

  return (
    <div className="w-full max-w-[40rem] mb-12 animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
         {/* Background accent */}
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-100 via-brand-primary to-gray-100"></div>

         <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="bg-gray-100 p-1.5 rounded-lg text-gray-700 animate-pulse">
                        <MousePointerClick size={16} />
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {selectedRole ? 'Your Custom Path' : 'Identify your role'}
                    </span>
                </div>
                {selectedRole && (
                    <button 
                        onClick={() => setSelectedRole(null)}
                        className="text-[10px] font-bold text-gray-400 hover:text-brand-primary flex items-center gap-1 transition-colors uppercase tracking-wider"
                    >
                        <RefreshCw size={10} /> Reset
                    </button>
                )}
            </div>

            {!selectedRole ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ROLES.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setSelectedRole(role.id as RoleType)}
                            className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-gray-50 border-2 border-transparent hover:border-brand-primary/20 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group text-center h-full min-h-[110px]"
                        >
                            <div className="text-gray-400 group-hover:text-brand-primary group-hover:scale-110 transition-all duration-300 bg-white p-2 rounded-full shadow-sm group-hover:shadow-md">
                                {role.icon}
                            </div>
                            <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900">{role.label}</span>
                        </button>
                    ))}
                    <div className="hidden md:flex flex-col items-center justify-center p-4 text-[10px] text-gray-400 font-medium text-center leading-tight">
                        <span className="opacity-50">Join 50k+ others improving their spaces</span>
                    </div>
                </div>
            ) : (
                <div className="animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                         <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center shrink-0 text-brand-primary shadow-inner">
                             {ROLES.find(r => r.id === selectedRole)?.icon}
                         </div>
                         <div className="flex-1">
                             <h4 className="text-lg font-display font-bold text-gray-900 mb-2">
                                For the {selectedRole}
                             </h4>
                             <p className="text-gray-600 leading-relaxed font-medium text-sm md:text-base">
                                "{ROLES.find(r => r.id === selectedRole)?.text}"
                             </p>
                         </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                         <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Recommended Action</div>
                         <div className="text-brand-primary text-xs font-bold flex items-center gap-2 animate-pulse">
                            <CheckCircle2 size={14} /> Get the Bundle
                         </div>
                    </div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};
