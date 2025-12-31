import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom'; // useNavigate hook added here
import toast from 'react-hot-toast';
import { Mic, MicOff } from 'lucide-react';
import Editor from './Editor';
import LanguageMenu from './LanguageMenu';
import Aside from './Aside';
import Terminal from './Terminal';
import ACTIONS from '../Actions.js';
import { initSocket } from '../socket.js';
import { io } from "socket.io-client";
import { CODE_SNIPPETS } from '../constants.js';
import { executeCode } from '@/api';

const Room = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || 'Guest';

  const [code, setCode] = useState(CODE_SNIPPETS['javascript']);
  const [output, setOutput] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const socketRef = useRef(null);
  const codeRef = useRef(code); // Keep track of current code for syncing
  const isRemoteChange = useRef(false); // Flag to prevent emitting on remote changes
  const [clients, setClients] = useState([]);
  // const connectedRef = useRef(false);

  // Update code when language changes
  useEffect(() => {
    setCode(CODE_SNIPPETS[language] || '');
    setLanguage(language);
  }, [language]);

  useEffect(() => {
    const init = async () => {
      // if (connectedRef.current) return;

      socketRef.current = await initSocket();

      const handleErrors = (e) => {
        console.log('Socket connection error:', e);
        toast.error('Socket connection failed, try again later.');
        navigate('/');
      };
      // error handling
      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));


      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      // listening for joined event
      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room.`);
          console.log(`${username} joined`);
          // Sync code to the newly joined user
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
        // updating clients list
        setClients(clients);
      });

      // Listening for code changes from other clients
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null && code !== undefined) {
          isRemoteChange.current = true;
          setCode(code);
          // Reset flag after state update
          setTimeout(() => {
            isRemoteChange.current = false;
          }, 0);
        }
      });

      // Listening for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };

    init();

    // clearing all listeners and disconnecting socket on unmount
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    }
  }, [roomId, username]);


  useEffect(() => {
    toast.success(`Connected to room: ${roomId}`);
  }, [roomId]);

  // Keep codeRef in sync with code state
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  const handleCodeChange = (value) => {
    setCode(value);
    // Only emit if this is a local change, not a remote one
    if (socketRef.current && !isRemoteChange.current) {
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        code: value,
      });
    }
  };

  const runCode = () => {
    setOutput([]);
    if(!code) return;
    setIsLoading(true);
    executeCode(language, code).then(response => {
      const outputData = response.run.output || 'Code executed successfully!';
      setOutput([outputData]);
    }).catch(error => {
      setOutput([`Error: ${error.message}`]);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    toast.success(isMicOn ? 'Microphone off' : 'Microphone on');
  };

  const leaveRoom = () => {
    toast.success('Left the room');
    navigate('/');
  };

  // Redirect if username/room Id is not provided
  // you need useEffect to avoid redirecting during rendering 'Room' component, which react does not allow
  useEffect(() => {
    if (!location.state) {
      navigate('/');
    }
  }, [location.state, navigate]);

  if (!location.state) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      <div className="bg-linear-to-r from-gray-800 to-gray-900 px-2 sm:px-6 py-2 sm:py-3 flex items-center justify-between border-b border-gray-700 shadow-lg">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-5">
            <div>
              <h2 className="text-white font-semibold text-sm sm:text-base">CodeBuds</h2>
              <p className="text-gray-400 text-[10px] sm:text-xs">Room: {roomId.slice(0, 8)}...</p>
            </div>
            <div>
              <LanguageMenu selected={language} onChange={setLanguage}></LanguageMenu>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-3">
          <button
            onClick={toggleMic}
            className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg font-medium transition text-xs sm:text-base ${isMicOn
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
          >
            {isMicOn ? <><Mic className="inline-block w-4 sm:w-5" /><span className="hidden sm:inline"> Mic On</span></> : <><MicOff className="inline-block w-4 sm:w-5" /><span className="hidden sm:inline"> Mic Off</span></>}
          </button>

          <button
            onClick={runCode}
            className="px-2 py-1 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-xs sm:text-base"
          >
            ▶<span className="hidden sm:inline"> Run</span>
          </button>

          <button
            onClick={leaveRoom}
            className="px-2 py-1 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition text-xs sm:text-base"
          >
            <span className="sm:hidden">✕</span><span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 border border-gray-700 m-1 sm:m-2 rounded-lg overflow-hidden bg-gray-800 shadow-xl">
            <div className="h-full">
              <Editor language={language} code={code} onChange={handleCodeChange} />
            </div>
          </div>

          <Terminal output={output} isLoading={isLoading} />
        </div>

        <div className="w-full sm:w-80 shrink-0 h-70 sm:h-auto">
          <Aside users={clients} currentUserName={location.state?.username}/>
        </div>
      </div>
    </div>
  );
};

export default Room;
