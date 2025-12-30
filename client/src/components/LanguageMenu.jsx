import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const LANGUAGES = [
    { id: 'c', name: 'C', icon: '/icons/c.png' },
    { id: 'cpp', name: 'C++', icon: '/icons/cpp.png' },
    { id: 'java', name: 'Java', icon: '/icons/java.png' },
    { id: 'python', name: 'Python', icon: '/icons/python.png' },
    { id: 'csharp', name: 'C#', icon: '/icons/csharp.png' },
    { id: 'rust', name: 'Rust', icon: '/icons/rust.png' },
    { id: 'javascript', name: 'Javascript', icon: '/icons/js.png' },
    { id: 'typescript', name: 'Typescript', icon: '/icons/ts.png' },
    { id: 'ruby', name: 'Ruby', icon: '/icons/ruby.png' },
    { id: 'go', name: 'Go', icon: '/icons/go.png' },
    { id: 'php', name: 'PHP', icon: '/icons/php.png' },
];


function LanguageMenu({ selected = 'javascript', onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedLang = LANGUAGES.find((lang) => lang.id === selected);

    const handleSelect = (lang) => {
        setIsOpen(false);
        if (onChange) {
            onChange(lang.id);
        }
    };

    return (
        <div className="relative cursor-pointer">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 bg-gray-700 hover:bg-gray-750 text-white rounded-lg transition duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                <img
                    src={selectedLang?.icon}
                    alt={selectedLang?.name}
                    className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                />

                <span className="hidden sm:inline text-sm font-medium">{selectedLang?.name}</span>
                <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 stroke-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />

            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-36 sm:w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.id}
                            onClick={() => handleSelect(lang)}
                            className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-left transition duration-150 ${selected === lang.id
                                ? 'bg-blue-800 text-white'
                                : 'text-zinc-200 hover:bg-gray-700'
                                }`}
                        >
                            <img
                                src={lang.icon}
                                alt={lang.name}
                                className="w-5 h-5 object-contain"
                            />

                            <span className="text-sm font-medium">{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </div>
    );
}

export default LanguageMenu;
