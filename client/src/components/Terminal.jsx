import { useState, useRef, useEffect } from 'react';

const Terminal = ({ output }) => {
    const [height, setHeight] = useState(200);
    const [isResizing, setIsResizing] = useState(false);
    const startYRef = useRef(0);
    const startHeightRef = useRef(0);

    const handleMouseDown = (e) => {
        setIsResizing(true);
        startYRef.current = e.clientY;
        startHeightRef.current = height;
        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';
    };

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e) => {
            if (!isResizing) return;
            const deltaY = startYRef.current - e.clientY;
            const newHeight = Math.max(100, Math.min(600, startHeightRef.current + deltaY));
            setHeight(newHeight);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, height]);


    return (
        <div
            className="bg-gray-900 border-t border-gray-700 flex flex-col"
            style={{ height: `${height}px` }}
        >
            <div
                className="h-1 bg-gray-700 hover:bg-blue-500 cursor-ns-resize transition-colors"
                onMouseDown={handleMouseDown}
            ></div>

            <div className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex space-x-2 items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300 text-sm font-medium">Terminal</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                <div className="text-green-400">
                    {output.length === 0 ? (
                        <div className="text-gray-500">Terminal output will appear here...</div>
                    ) : (
                        output.map((line, index) => (
                            <div key={index} className="mb-1">
                                {line}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Terminal;
