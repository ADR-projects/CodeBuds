const Aside = ({ users }) => {
  const avatarColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-red-500',
  ];

  return (
    <div className="h-full bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold text-lg">Room Members</h3>
        <p className="text-gray-400 text-sm mt-1">{users.length} connected</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {users.map((user, index) => (
            <div
              key={user.id}
              className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition"
            >
              <div
                className={`w-10 h-10 rounded-full ${
                  avatarColors[index % avatarColors.length]
                } flex items-center justify-center text-white font-semibold`}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {user.username}
                </p>
                <p className="text-gray-400 text-xs">
                  {user.isActive ? 'Active' : 'Idle'}
                </p>
              </div>
              <div
                className={`w-2 h-2 rounded-full ${
                  user.isActive ? 'bg-green-500' : 'bg-gray-500'
                }`}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Aside;
