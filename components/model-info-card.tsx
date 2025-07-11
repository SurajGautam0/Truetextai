"use client";

import React, { useState, useRef, useEffect } from 'react';

// Helper to combine class names
const cn = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(' ');

// --- Mock UI Components (inspired by shadcn/ui) ---

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
    {...props}
  />
));

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref as React.Ref<HTMLDivElement>} className={cn("p-6 pt-0", className)} {...props} />
  )
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
  const baseClasses = "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variantClasses = {
    default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
    outline: "text-foreground",
  };
  return <div className={cn(baseClasses, variantClasses[variant], className)} {...props} />;
};


// --- Model Data ---
const modelInfo = {
    "grok-3": { // Added for default
        internalName: "grok-3",
        displayName: "Grok 3",
        description: "The latest and most capable Grok model.",
        strengths: ["Advanced Reasoning", "Humor", "Real-time Info"],
        tokenLimit: 32768,
        speed: "Medium",
    },
    "gpt-4-turbo": {
        internalName: "gpt-4-turbo",
        displayName: "GPT-4 Turbo",
        description: "Fast and powerful GPT-4 variant",
        strengths: ["Fast responses", "High quality", "Good reasoning"],
        tokenLimit: 128000,
        speed: "Medium",
    },
    "gpt-3.5-turbo": {
        internalName: "gpt-3.5-turbo",
        displayName: "GPT-3.5 Turbo",
        description: "Fast and efficient model for general use",
        strengths: ["Quick responses", "Efficient processing", "Good quality"],
        tokenLimit: 16385,
        speed: "Fast",
    },
    "ninja-pro": {
        internalName: "ninja-pro",
        displayName: "Llama 3 (70B)",
        description: "Powerful model with excellent reasoning capabilities",
        strengths: ["Complex writing", "Detailed analysis", "Creative content"],
        tokenLimit: 8192,
        speed: "Medium",
    },
    "sage-opus": {
        internalName: "sage-opus",
        displayName: "Claude 3 Opus",
        description: "Most powerful Claude model for complex tasks",
        strengths: ["Complex reasoning", "Nuanced understanding", "High-quality output"],
        tokenLimit: 200000,
        speed: "Slow",
    },
};


// --- SVG Icons ---
const GrokLogo = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
        <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12C20 16.411 16.411 20 12 20Z" fill="currentColor"/>
        <path d="M12 6C8.686 6 6 8.686 6 12C6 15.314 8.686 18 12 18C15.314 18 18 15.314 18 12C18 8.686 15.314 6 12 6ZM12 16C9.791 16 8 14.209 8 12C8 9.791 9.791 8 12 8C14.209 8 16 9.791 16 12C16 14.209 14.209 16 12 16Z" fill="currentColor"/>
    </svg>
);

interface IconProps {
    className?: string;
}

const LockIcon = ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const MicIcon = ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
    </svg>
);

interface IconProps {
    className?: string;
}


const ChevronDownIcon = ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const ArrowUpIcon = ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
    </svg>
);

const CalendarIcon = ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);


// --- Main UI Component ---
function GrokUI() {
    const [selectedModel, setSelectedModel] = useState('grok-3');
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                (dropdownRef.current as HTMLElement).contains &&
                !(dropdownRef.current as HTMLElement).contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);
    
    const currentModel = modelInfo[selectedModel as keyof typeof modelInfo];

    return (
        <div className="bg-[#131314] text-gray-300 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
            <div className="absolute top-4 right-4">
                <Badge variant="outline" className="bg-[#202123] border-[#3c4043] text-gray-300 text-xs py-1 px-3">
                    <LockIcon className="mr-2 h-3 w-3" />
                    Private
                </Badge>
            </div>

            <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center flex-grow">
                <div className="mb-8">
                    <GrokLogo />
                </div>

                <div className="w-full p-2 bg-[#1e1f20] border border-[#3c4043] rounded-full flex items-center space-x-2 shadow-lg">
                    <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        <MicIcon className="text-gray-400" />
                    </button>
                    <input 
                        type="text" 
                        placeholder="What do you want to know?"
                        className="flex-grow bg-transparent focus:outline-none text-gray-200 placeholder-gray-500 text-lg"
                    />
                    
                    <div className="flex items-center space-x-2">
                         <button className="bg-[#2d2e30] hover:bg-[#3c4043] text-white font-medium py-2 px-4 rounded-full flex items-center transition-colors">
                            DeepSearch
                            <ChevronDownIcon className="ml-1 text-gray-400" />
                        </button>
                        <button className="bg-[#2d2e30] hover:bg-[#3c4043] text-white font-medium py-2 px-4 rounded-full transition-colors">
                            Think
                        </button>
                        
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setDropdownOpen(!isDropdownOpen)}
                                className="bg-[#2d2e30] hover:bg-[#3c4043] text-white font-medium py-2 px-4 rounded-full flex items-center transition-colors"
                            >
                                {currentModel.displayName}
                                <ChevronDownIcon className="ml-1 text-gray-400" />
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute bottom-full right-0 mb-2 w-64 bg-[#2d2e30] border border-[#3c4043] rounded-xl shadow-2xl z-10 overflow-hidden">
                                    {Object.keys(modelInfo).map((key) => {
                                        const modelKey = key as keyof typeof modelInfo;
                                        return (
                                            <div 
                                                key={key}
                                                onClick={() => {
                                                    setSelectedModel(key);
                                                    setDropdownOpen(false);
                                                }}
                                                className="p-4 hover:bg-[#3c4043] cursor-pointer"
                                            >
                                                <p className="font-semibold text-white">{modelInfo[modelKey].displayName}</p>
                                                <p className="text-sm text-gray-400">{modelInfo[modelKey].description}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <button className="p-2.5 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors">
                            <ArrowUpIcon className="text-white" />
                        </button>
                    </div>
                </div>

                <div className="mt-8 flex items-center space-x-4">
                    <button className="bg-[#202123] border border-[#3c4043] text-gray-300 py-2 px-4 rounded-full flex items-center hover:bg-[#2d2e30] transition-colors">
                        Receive a Daily Tech Digest
                        <ChevronDownIcon className="ml-2 text-gray-500" />
                    </button>
                     <button className="bg-[#202123] border border-[#3c4043] text-gray-300 py-2 px-4 rounded-full flex items-center hover:bg-[#2d2e30] transition-colors">
                        <CalendarIcon className="mr-2 text-gray-400"/>
                        Schedule Task
                    </button>
                </div>
            </div>
            
            <footer className="text-center py-4">
                <p className="text-xs text-gray-600">This is a conceptual UI inspired by modern AI interfaces.</p>
            </footer>
        </div>
    );
}

export default function ModelInfoGrid() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181A20] to-[#23242b] py-12 px-4">
      <h1 className="text-4xl font-bold text-center text-white mb-8 drop-shadow-lg">AI Model Gallery</h1>
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.values(modelInfo).map((model) => (
          <div
            key={model.internalName}
            className="bg-[#23242b] rounded-2xl shadow-xl border border-[#333] p-6 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition-transform duration-200"
          >
            <div className="mb-4">
              {/* You can use a model-specific icon here */}
              <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                {model.displayName}
              </span>
            </div>
            <p className="text-lg text-white font-semibold mb-2 text-center">{model.description}</p>
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              {model.strengths.map((s: string) => (
                <span
                  key={s}
                  className="bg-blue-900/60 text-blue-200 px-2 py-1 rounded text-xs font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="flex justify-between w-full text-sm text-gray-400 mt-auto">
              <span>Tokens: <span className="text-white">{model.tokenLimit}</span></span>
              <span>Speed: <span className="text-white">{model.speed}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
