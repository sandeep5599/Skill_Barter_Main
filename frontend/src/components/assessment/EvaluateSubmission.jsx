// src/components/assessment/EvaluateSubmission.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../../services/socketService';

const EvaluateSubmission = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await axios.get(`/api/assessments/submission/${submissionId}`);
        setSubmission(response.data.submission);
      } catch (error) {
        setError('Failed to load submission details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmission();
  }, [submissionId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (marks === '' || isNaN(Number(marks)) || Number(marks) < 0) {
      setError('Please enter a valid marks value');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      // Add socket ID to headers for socket.io notifications
      const headers = {
        'X-Socket-ID': socket?.id || ''
      };
      
      const response = await axios.patch(
        `/api/assessments/submission/${submissionId}/evaluate`,
        {
          marks: Number(marks),
          feedback
        },
        { headers }
      );
      
      if (response.data.success) {
        navigate(`/assessments/${submission.assessmentId}/submissions`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error evaluating submission');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div>Loading submission details...</div>;
  }
  
  if (!submission) {
    return <div>Submission not found</div>;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Evaluate Submission</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Submission Details</h3>
        <p className="text-gray-700">
          <strong>Learner:</strong> {submission.submittedBy.name}
        </p>
        <p className="text-gray-700">
          <strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}
        </p>
        <p className="text-gray-700">
          <strong>Status:</strong> <span className="capitalize">{submission.status}</span>
        </p>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Submission Files</h3>
        <p className="mb-2">
          <a
            href={submission.answersPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center"
          >
            <span>View/Download Answers PDF</span>
          </a>
        </p>
        <p>
          <a
            href={submission.assessmentId.questionsPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center"
          >
            <span>View/Download Questions PDF</span>
          </a>
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="marks">
            Marks
          </label>
          <input
            id="marks"
            type="number"
            min="0"
            step="0.5"
            className="w-full px-3 py-2 border rounded"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="feedback">
            Feedback
          </label>
          <textarea
            id="feedback"
            className="w-full px-3 py-2 border rounded"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows="4"
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Evaluation'}
        </button>
      </form>
    </div>
  );
};

export default EvaluateSubmission;