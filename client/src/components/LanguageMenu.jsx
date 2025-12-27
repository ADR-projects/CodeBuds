import { useState } from 'react';

const LANGUAGES = [
    //   { id: 'c', name: 'C', icon: '/icons/c.png' },
    //   { id: 'cpp', name: 'C++', icon: '/icons/cpp.png' },
    { id: 'java', name: 'Java', icon: '/icons/java.png' },
    { id: 'javascript', name: 'Javascript', icon: '/icons/js.png' },
    //   { id: 'python', name: 'Python', icon: '/icons/python.png' },
    //   { id: 'ruby', name: 'Ruby', icon: '/icons/ruby.png' },
    //   { id: 'go', name: 'Go', icon: '/icons/go.png' },
];


function LanguageMenu({ selected = 'javascript', onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedLang = LANGUAGES.find((lang) => lang.id === selected);

    const handleSelect = (lang) => {
        onChange(lang.id);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 text-white rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <img
                    src={selectedLang?.icon}
                    alt={selectedLang?.name}
                    className="w-4 h-4 object-contain"
                />

                <span className="text-sm font-medium">{selectedLang?.name}</span>
                <svg
                    className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.id}
                            onClick={() => handleSelect(lang)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition duration-150 ${selected === lang.id
                                ? 'bg-blue-600 text-white'
                                : 'text-zinc-200 hover:bg-zinc-700'
                                }`}
                        >
                            <img
                                src={lang.icon}
                                alt={lang.name}
                                className="w-4 h-4 object-contain"
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
