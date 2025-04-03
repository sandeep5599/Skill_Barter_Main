import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { Calendar, CheckCircle, PlusCircle } from 'react-bootstrap-icons';
import Loading from '../common/Loading';
import Error from '../common/Error';

const CreateSessionAssessment = ({ userId, initialSession = null, onComplete }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [completedSessions, setCompletedSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(initialSession);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillId: '',
    sessionId: '',
    questions: [{ text: '', points: 10 }],
    dueDate: '',
    status: 'active'
  });
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        if (!userId) return;
  
        // Fetch completed sessions where the user was a teacher using fetch API
        const response = await fetch(`/api/sessions/user/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          cache: 'no-store' // Prevent caching
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        const teachingSessions = data.sessions.filter(
          session => session.status === 'completed' && session.isTeaching === true
        );
        setCompletedSessions(teachingSessions);
  
        // If initialSession is provided, select it
        if (initialSession) {
          setSelectedSession(initialSession);
          populateFormFromSession(initialSession);
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load sessions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchSessions();
  }, [userId, initialSession]);

  const populateFormFromSession = (session) => {
    // Extract notes and create questions based on session content
    const sessionNotes = session.notes || '';
    const defaultTitle = `${session.skillDetails?.title || 'Skill'} Assessment`;
    
    // Create default questions based on session content if possible
    let defaultQuestions = [{ text: 'How would you rate the session?', points: 10 }];
    
    // If session has notes, create a question about applying concepts
    if (sessionNotes) {
      defaultQuestions.push({
        text: 'Apply the concepts discussed in our session to a real-world scenario.',
        points: 30
      });
    }
    
    setFormData({
      title: defaultTitle,
      description: `Assessment based on our session on ${new Date(session.date).toLocaleDateString()}.`,
      skillId: session.skillId || '',
      sessionId: session._id || '',
      questions: defaultQuestions,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due in 7 days
      status: 'active'
    });
  };

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    populateFormFromSession(session);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { text: '', points: 10 }]
    });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(index, 1);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      setError('Assessment title is required.');
      return;
    }
    
    if (!formData.skillId) {
      setError('Please select a session to create an assessment from.');
      return;
    }
    
    if (formData.questions.some(q => !q.text.trim())) {
      setError('All questions must have text.');
      return;
    }
  
    try {
      setSubmitting(true);
      setError('');
  
      // Create the assessment using fetch API
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
        cache: 'no-store'
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Assessment created successfully!');
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          } else {
            navigate(`/skills/${formData.skillId}/assessments`);
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating assessment:', err);
      setError('Failed to create assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading message="Loading sessions..." />;
  }

  return (
    <div className="create-session-assessment">
      <h5 className="fw-bold mb-4">Create Assessment from Session</h5>
      
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success">
          {success}
        </Alert>
      )}

      {/* Session Selection */}
      {!selectedSession && completedSessions.length > 0 && (
        <div className="mb-4">
          <h6 className="fw-bold mb-3">Select a teaching session</h6>
          <div className="row g-3">
            {completedSessions.map(session => (
              <div key={session._id} className="col-md-6 col-lg-4">
                <Card 
                  className={`h-100 border shadow-sm rounded-3 cursor-pointer`}
                  onClick={() => handleSessionSelect(session)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center mb-2">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2">
                        <Calendar className="text-primary" />
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{session.skillDetails?.title || 'Skill Session'}</h6>
                        <small className="text-muted">{new Date(session.date).toLocaleDateString()}</small>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between small mb-2">
                      <span className="text-muted">Student:</span>
                      <span>{session.learnerDetails?.name || 'Student'}</span>
                    </div>
                    <div className="text-center mt-3">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="rounded-pill px-3 d-flex align-items-center justify-content-center"
                      >
                        <PlusCircle className="me-1" size={14} />
                        <span>Select Session</span>
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Sessions Message */}
      {!selectedSession && completedSessions.length === 0 && (
        <div className="text-center py-5">
          <div className="mb-3">
            <Calendar size={48} className="text-muted" />
          </div>
          <h5 className="fw-bold">No Completed Teaching Sessions</h5>
          <p className="text-muted">You haven't completed any sessions as a teacher yet.</p>
        </div>
      )}

      {/* Assessment Creation Form */}
      {selectedSession && (
        <Form onSubmit={handleSubmit}>
          <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-header bg-light border-0 py-3">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                  <Calendar className="text-primary" />
                </div>
                <div>
                <h6 className="mb-0 fw-bold">{selectedSession.skillDetails?.title || 'Creating Assessment'}</h6>
                  <small className="text-muted">Session from {new Date(selectedSession.date).toLocaleDateString()}</small>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Assessment Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter assessment title"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter assessment description"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Due Date</Form.Label>
                <Form.Control
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <hr className="my-4" />
              
              <div className="mb-3">
                <label className="fw-bold mb-3">Assessment Questions</label>
                
                {formData.questions.map((question, index) => (
                  <div key={index} className="card border mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <h6 className="fw-bold mb-0">Question {index + 1}</h6>
                        {formData.questions.length > 1 && (
                          <Button 
                            variant="link" 
                            className="text-danger p-0" 
                            onClick={() => removeQuestion(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Question Text</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={question.text}
                          onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                          placeholder="Enter question"
                          required
                        />
                      </Form.Group>
                      
                      <Form.Group>
                        <Form.Label>Points (1-100)</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          max="100"
                          value={question.points}
                          onChange={(e) => handleQuestionChange(index, 'points', parseInt(e.target.value))}
                          required
                        />
                      </Form.Group>
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline-primary" 
                  className="d-flex align-items-center" 
                  onClick={addQuestion}
                  type="button"
                >
                  <PlusCircle className="me-2" />
                  Add Question
                </Button>
              </div>
            </div>
            <div className="card-footer bg-light border-0 py-3">
              <div className="d-flex justify-content-end gap-2">
                <Button 
                  variant="outline-secondary" 
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  disabled={submitting}
                >
                  Back
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Assessment'}
                </Button>
              </div>
            </div>
          </div>
        </Form>
      )}
    </div>
  );
};

export default CreateSessionAssessment;