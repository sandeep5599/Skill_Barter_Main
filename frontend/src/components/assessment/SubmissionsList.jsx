// src/components/assessment/SubmissionsList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useUserStatus } from '../UserStatusProvider';

const SubmissionsList = () => {
  const { assessmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userStatuses, fetchUserStatuses } = useUserStatus();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch assessment details
        const assessmentResponse = await axios.get(`/api/assessments/${assessmentId}`);
        setAssessment(assessmentResponse.data.assessment);
        
        // Fetch submissions
        const submissionsResponse = await axios.get(`/api/assessments/${assessmentId}/submissions`);
        setSubmissions(submissionsResponse.data.submissions);
        
        // Fetch online status for all submitters
        const userIds = submissionsResponse.data.submissions.map(sub => sub.submittedBy._id);
        fetchUserStatuses(userIds);
      } catch (error) {
        setError('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [assessmentId, fetchUserStatuses]);
  
  if (loading) {
    return <div>Loading submissions...</div>;
  }
  
  if (error) {
    return <div className="text-red-600">{error}</div>;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        Submissions for {assessment?.title || 'Assessment'}
      </h2>
      
      {submissions.length === 0 ? (
        <p className="text-gray-600">No submissions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Learner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => {
                const userStatus = userStatuses[submission.submittedBy._id] || { isOnline: false };
                
                return (
                  <tr key={submission._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {submission.submittedBy.name}
                          </div>
                          <div className="flex items-center mt-1">
                            <div className={`h-2 w-2 rounded-full mr-2 ${userStatus.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <div className="text-xs text-gray-500">
                              {userStatus.isOnline ? 'Online' : 'Offline'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${submission.status === 'evaluated' ? 'bg-green-100 text-green-800' : 
                        submission.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.status === 'evaluated' ? submission.marks : 'Not evaluated'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={submission.answersPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </a>
                      {submission.status !== 'evaluated' && (
                        <Link
                          to={`/assessments/submission/${submission._id}/evaluate`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Evaluate
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubmissionsList;