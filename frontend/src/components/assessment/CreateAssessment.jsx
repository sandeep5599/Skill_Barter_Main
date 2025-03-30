import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { socket } from '../../services/socketService';

const CreateAssessment = ({ skillId }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questionsPdf, setQuestionsPdf] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file && file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }
    
    setQuestionsPdf(file);
    setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!questionsPdf) {
      setError('Please upload a PDF file with questions');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('skillId', skillId);
    formData.append('questionsPdf', questionsPdf);
    
    if (dueDate) {
      formData.append('dueDate', dueDate);
    }
    
    try {
      // Add socket ID to headers for socket.io notifications
      const headers = {
        'Content-Type': 'multipart/form-data',
        'X-Socket-ID': socket?.id || ''
      };
      
      const response = await axios.post('/api/assessments/create', formData, { headers });
      
      if (response.data.success) {
        navigate(`/skills/${skillId}/assessments`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating assessment');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create New Assessment</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="w-full px-3 py-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="questionsPdf">
            Questions PDF
          </label>
          <input
            id="questionsPdf"
            type="file"
            accept="application/pdf"
            className="w-full"
            onChange={handleFileChange}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload a PDF file containing all assessment questions.
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="dueDate">
            Due Date (Optional)
          </label>
          <input
            id="dueDate"
            type="datetime-local"
            className="w-full px-3 py-2 border rounded"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Assessment'}
        </button>
      </form>
    </div>
  );
};

export default CreateAssessment;