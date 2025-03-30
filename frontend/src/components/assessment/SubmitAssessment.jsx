// src/components/assessment/SubmitAssessment.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../../services/socketService';

const SubmitAssessment = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [answersPdf, setAnswersPdf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await axios.get(`/api/assessments/${assessmentId}`);
        setAssessment(response.data.assessment);
      } catch (error) {
        setError('Failed to load assessment details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessment();
  }, [assessmentId]);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file && file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }
    
    setAnswersPdf(file);
    setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!answersPdf) {
      setError('Please upload a PDF file with your answers');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    const formData = new FormData();
    formData.append('answersPdf', answersPdf);
    
    try {
      // Add socket ID to headers for socket.io notifications
      const headers = {
        'Content-Type': 'multipart/form-data',
        'X-Socket-ID': socket?.id || ''
      };
      
      const response = await axios.post(
        `/api/assessments/${assessmentId}/submit`,
        formData,
        { headers }
      );
      
      if (response.data.success) {
        navigate('/assessments/submitted');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting assessment');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div>Loading assessment details...</div>;
  }
  
  if (!assessment) {
    return <div>Assessment not found</div>;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Submit Assessment: {assessment.title}</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Description</h3>
        <p className="text-gray-700">{assessment.description}</p>
        
        {assessment.dueDate && (
          <p className="text-sm text-gray-600 mt-2">
            Due by: {new Date(assessment.dueDate).toLocaleString()}
          </p>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Download Questions</h3>
        <a
          href={assessment.questionsPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center"
        >
          <span>View/Download Questions PDF</span>
        </a>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="answersPdf">
            Your Answers (PDF)
          </label>
          <input
            id="answersPdf"
            type="file"
            accept="application/pdf"
            className="w-full"
            onChange={handleFileChange}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload a PDF file containing your answers.
          </p>
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Assessment'}
        </button>
      </form>
    </div>
  );
};

export default SubmitAssessment;