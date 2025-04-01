// src/components/assessment/TabNavigation.jsx
import React from 'react';

const TabNavigation = ({ activeTab, handleTabChange, isSkillSharer, isAuthenticated }) => {
  return (
    <div className="border-b">
      <nav className="flex">
        <button
          className={`px-4 py-3 text-sm font-medium ${
            activeTab === 'available'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => handleTabChange('available')}
        >
          Available Assessments
        </button>
        
        {isAuthenticated && (
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'my-submissions'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('my-submissions')}
          >
            My Submissions
          </button>
        )}
        
        {isSkillSharer && (
          <>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'create'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('create')}
            >
              Create Assessment
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'submissions'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('submissions')}
            >
              Manage Submissions
            </button>
          </>
        )}
      </nav>
    </div>
  );
};

export default TabNavigation;