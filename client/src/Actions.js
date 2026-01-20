const ACTIONS = {
    JOIN: 'join',
    JOINED: 'joined',
    DISCONNECTED: 'disconnected',
    CODE_CHANGE: 'code-change',
    SYNC_CODE: 'sync-code',
    SYNC_STATE: 'sync-state', // Syncs both code and language to new users
    LEAVE: 'leave',
    LANGUAGE_CHANGE: 'language-change',
    CURSOR_CHANGE: 'cursor-change',
    ROOM_EXISTS: 'room-exists',
    KICK_USER: 'kick-user',
    USER_KICKED: 'user-kicked',
    HOST_CHANGED: 'host-changed',
};

export default ACTIONS;