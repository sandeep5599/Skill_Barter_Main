// src/components/assessment/AssessmentList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import Loading from '../common/Loading';
import Error from '../common/Error';

const AssessmentList = ({ isSkillSharer }) => {
  const { skillId } = useParams();
  const [assessments, setAssessments] = useState([]);
  const [skillName, setSkillName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        if (!skillId) {
          setLoading(false);
          setError('Invalid skill ID');
          return;
        }
        
        // Fetch skill details to get the name
        const skillResponse = await axios.get(`/api/skills/${skillId}`);
        setSkillName(skillResponse.data.skill.name);
        
        // Fetch assessments for this skill
        const assessmentsResponse = await axios.get(`/api/skills/${skillId}/assessments`);
        setAssessments(assessmentsResponse.data.assessments);
      } catch (error) {
        setError('Failed to load assessments');
      } finally {
        setLoading(false);
      }
    };
    
    if (skillId) {
      fetchAssessments();
    } else {
      setLoading(false);
    }
  }, [skillId]);
  
  if (loading) {
    return <Loading message="Loading assessments..." />;
  }
  
  if (error) {
    return <Error message={error} />;
  }
  
  return (
    <div className="bg-white rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Assessments for {skillName}
        </h2>
        {isSkillSharer && (
          <Link
            to={`/skills/${skillId}/assessments/create`}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Create Assessment
          </Link>
        )}
      </div>
      
      {assessments.length === 0 ? (
        <p className="text-gray-600">No assessments available for this skill.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <AssessmentCard 
              key={assessment._id} 
              assessment={assessment} 
              isSkillSharer={isSkillSharer}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Extract Assessment Card as a separate component
const AssessmentCard = ({ assessment, isSkillSharer }) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <h3 className="font-semibold mb-2">{assessment.title}</h3>
      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{assessment.description}</p>
      
      {assessment.dueDate && (
        <p className="text-xs text-gray-500 mb-3">
          Due: {new Date(assessment.dueDate).toLocaleDateString()}
        </p>
      )}
      
      <div className="flex space-x-2 mt-4">
        <Link
          to={`/assessments/${assessment._id}/submit`}
          className="text-sm bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700"
        >
          Take Assessment
        </Link>
        {isSkillSharer && (
          <Link
            to={`/assessments/${assessment._id}/submissions`}
            className="text-sm bg-gray-600 text-white py-1 px-3 rounded hover:bg-gray-700"
          >
            View Submissions
          </Link>
        )}
      </div>
    </div>
  );
};

export default AssessmentList;