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

const Room = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || 'Guest';

  const [code, setCode] = useState('// Start coding here...\n\nfunction hello() {\n  console.log("Hello, World!");\n}\n\nhello();');
  const [output, setOutput] = useState([]);
  const [isMicOn, setIsMicOn] = useState(false);
  const socketRef = useRef(null);
  const [clients, setClients] = useState([]);
  // const connectedRef = useRef(false);

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
        }
        // updating clients list
        setClients(clients);
        // socketRef.current.emit(ACTIONS.SYNC_CODE, {
        //   code,
        //   socketId,
        // });
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
    }
  }, [roomId, username]);


  useEffect(() => {
    toast.success(`Connected to room: ${roomId}`);
  }, [roomId]);

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const runCode = () => {
    setOutput([]);
    const logs = [];

    const originalLog = console.log;
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };

    try {
      // TODO: CHANGE EVAL TO CODEMIRROR FUNCTIONALITY
      eval(code);
      setOutput(logs.length > 0 ? logs : ['Code executed successfully!']);
      //toast.success('Code executed!');
    } catch (error) {
      setOutput([`Error: ${error.message}`]);
      // toast.error('Execution error!');
    } finally {
      console.log = originalLog;
    }
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    toast.success(isMicOn ? 'Microphone off' : 'Microphone on');
  };

  const leaveRoom = () => {
    toast.success('Left the room');
    navigate('/');
  };

  if (!location.state) { // Redirect if username, room Id is not provided
    navigate('/');
  }
  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      <div className="bg-linear-to-r from-gray-800 to-gray-900 px-6 py-3 flex items-center justify-between border-b border-gray-700 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex items-center space-x-3"> {/*you can add something beside the heading here*/}
            <div >
              <h2 className="text-white font-semibold">CodeBuds Editor</h2>
              <p className="text-gray-400 text-xs">Room: {roomId.slice(0, 8)}...</p>
            </div>
            <div>
              <LanguageMenu></LanguageMenu>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleMic}
            className={`px-4 py-2 rounded-lg font-medium transition ${isMicOn
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
          >
            {isMicOn ? <><Mic className="inline-block w-5" /> Mic On</> : <><MicOff className="inline-block w-5" /> Mic Off</>}
          </button>

          <button
            onClick={runCode}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            ▶ Run Code
          </button>

          <button
            onClick={leaveRoom}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
          >
            Leave
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 border border-gray-700 m-2 rounded-lg overflow-hidden bg-gray-800 shadow-xl">
            <div className="h-full">
              <Editor code={code} onChange={handleCodeChange} />
            </div>
          </div>

          <Terminal output={output} />
        </div>

        <div className="w-80 shrink-0">
          <Aside users={clients} />
        </div>
      </div>
    </div>
  );
};

export default Room;
