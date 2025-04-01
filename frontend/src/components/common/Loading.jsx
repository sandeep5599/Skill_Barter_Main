// src/components/common/Loading.jsx
import React from 'react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
      <span className="text-gray-600">{message}</span>
    </div>
  );
};

export default Loading;

