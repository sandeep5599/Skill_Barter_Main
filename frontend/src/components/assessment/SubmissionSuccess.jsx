// src/components/assessment/SubmissionSuccess.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SubmissionSuccess = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-8">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <svg
          className="h-6 w-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="mt-3 text-lg font-medium text-gray-900">
        Assessment Submitted Successfully!
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Your assessment has been submitted and will be evaluated by the skill sharer.
      </p>
      <div className="mt-6">
        <button
          onClick={() => navigate(-2)}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Return to Assessments
        </button>
      </div>
    </div>
  );
};

export default SubmissionSuccess;