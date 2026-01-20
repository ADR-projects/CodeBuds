import toast from 'react-hot-toast';
import { Crown, UserMinus } from 'lucide-react';

const Aside = ({ users, currentUserName, mySocketId, hostSocketId, isHost, onKickUser }) => {
  const avatarColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-red-500',
  ];
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(users[0].user.roomId);
      toast.success('Room ID copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy Room ID:', err);
    }
  };

  const handleKick = (socketId, username) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span>Kick <strong>{username}</strong> from the room?</span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
            onClick={() => {
              toast.dismiss(t.id);
              onKickUser(socketId);
            }}
          >
            Yes, kick
          </button>
          <button
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  return (
    <div className="h-full bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold text-lg">Room Members</h3>
        <p className="text-gray-400 text-sm mt-1">{users.length} connected</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {users.map((client, index) => {
            const isClientHost = client.socketId === hostSocketId;
            const isMe = client.socketId === mySocketId;
            const canKick = isHost && !isMe;
            
            return (
              <div
                key={client.socketId}
                className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition group"
              >
                <div
                  className={`w-10 h-10 rounded-full ${avatarColors[index % avatarColors.length]
                    } flex items-center justify-center text-white font-semibold relative`}
                >
                  {client.user?.username?.charAt(0).toUpperCase()}
                  {isClientHost && (
                    <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate flex items-center gap-2">
                    {client.user?.username}
                    {isMe && <span className="text-gray-400 text-xs">(You)</span>}
                    {isClientHost && <span className="text-yellow-400 text-xs">Host</span>}
                  </p>
                </div>
                {canKick && (
                  <button
                    onClick={() => handleKick(client.socketId, client.user?.username)}
                    className="opacity-90 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 cursor-pointer hover:bg-white rounded transition"
                    title="Kick user"
                  >
                    <UserMinus className="w-5 h-5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={copyRoomId}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          Copy Room ID
        </button>
      </div>
    </div>
  );
};

export default Aside;
