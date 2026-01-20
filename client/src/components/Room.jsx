import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom'; // useNavigate hook added here
import toast from 'react-hot-toast';
import { Mic, MicOff, Copy, Download } from 'lucide-react';
import Editor from './Editor';
import LanguageMenu from './LanguageMenu';
import Aside from './Aside';
import Terminal from './Terminal';
import ACTIONS from '../Actions.js';
import { initSocket } from '../socket.js';
import { io } from "socket.io-client";
import { CODE_SNIPPETS } from '../constants.js';
import { executeCode } from '@/api';
import { getColorForUser } from '../remoteCursors.js';

const Room = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || 'Guest';

  const [output, setOutput] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const socketRef = useRef(null);
  const codeRef = useRef(CODE_SNIPPETS['javascript']); // Keep track of current code for syncing
  const [clients, setClients] = useState([]);
  const editorRef = useRef(null); // Ref to access Editor methods
  const remoteCursorsRef = useRef({}); // Track remote cursor positions { socketId: { pos, username } }
  const [hostSocketId, setHostSocketId] = useState(null); // Track who is the host
  const [mySocketId, setMySocketId] = useState(null); // Track own socket ID
  // const connectedRef = useRef(false);

  // Check if current user is the host
  const isHost = mySocketId && hostSocketId && mySocketId === hostSocketId;

  // Update code when language changes
  useEffect(() => {
    const newCode = CODE_SNIPPETS[language] || '';
    codeRef.current = newCode;
    // Editor will recreate itself when language changes (see Editor.jsx useEffect dependency)
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

      // Store own socket ID when connected
      socketRef.current.on('connect', () => {
        setMySocketId(socketRef.current.id);
      });
      // Also set immediately if already connected
      if (socketRef.current.connected) {
        setMySocketId(socketRef.current.id);
      }

      // Set up listeners BEFORE joining to avoid race conditions
      // Listening for code changes from other clients
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null && code !== undefined) {
          // Update state for codeRef sync
          codeRef.current = code;
          // Directly update editor content via ref (avoids React state sync issues)
          if (editorRef.current?.setContent) {
            editorRef.current.setContent(code);
          }
        }
      });

      // Listening for language changes from other clients
      socketRef.current.on(ACTIONS.LANGUAGE_CHANGE, ({ language: newLanguage }) => {
        console.log('Received LANGUAGE_CHANGE:', newLanguage);
        setLanguage(newLanguage);
      });

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      // listening for joined event
      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId, hostSocketId }) => {
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room.`);
          console.log(`${username} joined`);
          // Sync code and language to the newly joined user
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            language: language,
            socketId,
          });
        }
        // Update host and clients list
        setHostSocketId(hostSocketId);
        setClients(clients);
      });

      // Listening for cursor changes from other clients
      socketRef.current.on(ACTIONS.CURSOR_CHANGE, ({ socketId, username, cursorPos }) => {
        // Update remote cursors map
        remoteCursorsRef.current[socketId] = { pos: cursorPos, username };
        updateEditorCursors();
      });

      // Listening for host changes
      socketRef.current.on(ACTIONS.HOST_CHANGED, ({ newHostSocketId, newHostUsername }) => {
        setHostSocketId(newHostSocketId);
        toast.success(`${newHostUsername} is now the host.`);
      });

      // Listening for being kicked
      socketRef.current.on(ACTIONS.USER_KICKED, ({ kickedBy }) => {
        toast.error(`You were kicked by ${kickedBy}`);
        navigate('/');
      });

      // Listening for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        // Remove cursor for disconnected user
        delete remoteCursorsRef.current[socketId];
        updateEditorCursors();
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
      socketRef.current.off(ACTIONS.CURSOR_CHANGE);
      socketRef.current.off(ACTIONS.LANGUAGE_CHANGE);
      socketRef.current.off(ACTIONS.HOST_CHANGED);
      socketRef.current.off(ACTIONS.USER_KICKED);
    }
  }, [roomId, username]);


  useEffect(() => {
    toast.success(`Connected to room: ${roomId}`);
  }, [roomId]);

  // Helper function to update editor with remote cursors
  const updateEditorCursors = () => {
    if (editorRef.current) {
      const cursors = Object.entries(remoteCursorsRef.current).map(([socketId, data], index) => ({
        pos: data.pos,
        color: getColorForUser(index),
        username: data.username,
      }));
      editorRef.current.updateRemoteCursors(cursors);
    }
  };

  // Kick a user from the room (host only)
  const kickUser = (targetSocketId) => {
    if (socketRef.current && isHost) {
      socketRef.current.emit(ACTIONS.KICK_USER, {
        roomId,
        targetSocketId,
      });
    }
  };

  const handleCodeChange = (value) => {
    // Only update ref, don't trigger React re-render
    codeRef.current = value;
    // Emit local changes to other clients
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        code: value,
      });
    }
  };

  // Handle cursor position changes
  const handleCursorChange = (pos) => {
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.CURSOR_CHANGE, {
        roomId,
        cursorPos: pos,
      });
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    // Emit language change to other clients
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, {
        roomId,
        language: newLanguage,
      });
    }
  };

  const runCode = () => {
    setOutput([]);
    const currentCode = codeRef.current;
    if (!currentCode) return;
    setIsLoading(true);
    executeCode(language, currentCode).then(response => {
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

  // Copy code to clipboard
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeRef.current);
      toast.success('Code copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  // Download code as file
  const downloadCode = () => {
    const extensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      ruby: 'rb',
      php: 'php',
    };
    const ext = extensions[language] || 'txt';
    const blob = new Blob([codeRef.current], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Code downloaded!');
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
              <p className="text-gray-400 text-[10px] sm:text-xs font-mono">Room: {roomId}</p>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <LanguageMenu selected={language} onChange={handleLanguageChange} />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={copyCode}
                className="p-2 text-gray-400 hover:text-gray-800 rounded-lg hover:bg-white transition"
                title="Copy code"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={downloadCode}
                className="p-2 text-gray-400 hover:text-gray-800 rounded-2xl hover:bg-white transition"
                title="Download code"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* <button
            onClick={toggleMic}
            className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg font-medium transition text-xs sm:text-base ${isMicOn
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
          >
            {isMicOn ? <><Mic className="inline-block w-4 sm:w-5" /><span className="hidden sm:inline"> Mic On</span></> : <><MicOff className="inline-block w-4 sm:w-5" /><span className="hidden sm:inline"> Mic Off</span></>}
          </button> */}
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
              <Editor
                ref={editorRef}
                language={language}
                code={CODE_SNIPPETS[language]}
                onChange={handleCodeChange}
                onCursorChange={handleCursorChange}
              />
            </div>
          </div>

          <Terminal output={output} isLoading={isLoading} />
        </div>

        <div className="w-full sm:w-80 shrink-0 h-70 sm:h-auto">
          <Aside
            users={clients}
            currentUserName={location.state?.username}
            mySocketId={mySocketId}
            hostSocketId={hostSocketId}
            isHost={isHost}
            onKickUser={kickUser}
          />
        </div>
      </div>
    </div>
  );
};

export default Room;
