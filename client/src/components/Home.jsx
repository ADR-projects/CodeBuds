import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import Typewriter from 'typewriter-effect';
import {Code} from 'lucide-react'

const Home = () => {
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const createNewRoom = () => {
        const newRoomId = uuidv4();
        setRoomId(newRoomId);
        toast.success('New room ID generated!');
    };

    const joinRoom = () => {
        if (!roomId.trim()) {
            toast.error('Please enter a room ID');
            return;
        }
        if (!username.trim()) {
            toast.error('Please enter your username');
            return;
        }
        navigate(`/editor/${roomId}`, { state: { username } });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            joinRoom();
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-500">
                    <div className="bg-linear-to-r from-gray-700 to-gray-800 px-4 py-3 flex items-center space-x-2">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="flex-1 text-center mr-16 text-gray-300 text-sm font-medium">
                            <Code className="inline-block mr-2 w-5 mt-0" />CodeBuds
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                <Typewriter
                                    options={{
                                        strings: ['Welcome 2 CodeBuds!', 'Let\'s Code Together!', 'Call Your Buds...'],
                                        autoStart: true,
                                        loop: true,
                                    }}
                                />
                            </h1>
                            <p className="text-gray-400 text-sm">
                                Collaborate in real-time with your team
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="roomId" className="block text-gray-300 text-sm font-medium mb-2">
                                    Room ID
                                </label>
                                <input
                                    id="roomId"
                                    type="text"
                                    autoComplete="room-id"
                                    placeholder="Enter room ID"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    onKeyUp={handleKeyPress}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>

                            <div>
                                <label htmlFor="username" className="block text-gray-300 text-sm font-medium mb-2">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyUp={handleKeyPress}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>

                            <button
                                onClick={joinRoom}
                                className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Join Room
                            </button>

                            <p className="text-center text-gray-400 text-sm">
                                If you don&apos;t have a room ID,{' '}
                                <button
                                    onClick={createNewRoom}
                                    className="text-blue-400 hover:text-blue-300 font-medium underline"
                                >
                                    create one
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                <footer className="mt-8 text-center">
                    <p className="text-gray-500 text-xs">
                        Built with 💙 by <a className="text-blue-400 hover:text-blue-300" href="https://github.com/ADR-projects">ADR-projects</a>
                    </p>
                </footer>
            </div>

            <style>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
        </div>
    );
};

export default Home;
