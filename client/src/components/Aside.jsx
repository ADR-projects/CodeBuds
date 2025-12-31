import toast from 'react-hot-toast';

const Aside = ({ users, currentUserName }) => {
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

  return (
    <div className="h-full bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold text-lg">Room Members</h3>
        <p className="text-gray-400 text-sm mt-1">{users.length} connected</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {users.map((client, index) => (
            <div
              key={client.socketId}
              className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition"
            >
              <div
                className={`w-10 h-10 rounded-full ${avatarColors[index % avatarColors.length]
                  } flex items-center justify-center text-white font-semibold`}
              >
                {client.user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {client.user?.username === currentUserName ?
                   `${client.user?.username}(You)` :
                   client.user?.username
                  }
                </p>
              </div>
            </div>
          ))}
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
