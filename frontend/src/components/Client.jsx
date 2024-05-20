import React from 'react';
import Avatar from 'react-avatar';

const Client = ({ username }) => {
    return (
        <div className="my-3 mx-3 flex items-cente">
            <Avatar name={username} size={38} round="14px" />
            <span className="mx-2 text-white">{username}</span>
        </div>
    );
};

export default Client;