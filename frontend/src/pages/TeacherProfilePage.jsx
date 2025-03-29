// frontend/src/pages/TeacherProfilePage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { FaStar, FaGraduationCap, FaCalendarAlt, FaComments } from 'react-icons/fa';
import axios from 'axios';

const TeacherProfilePage = () => {
  const { teacherId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const response = await axios.get(`/api/search/teacher/${teacherId}`);
        setProfileData(response.data.data);
      } catch (err) {
        console.error('Error fetching teacher profile:', err);
        setError(err.response?.data?.message || 'Error loading teacher profile');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherProfile();
  }, [teacherId]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading teacher profile...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const { teacher, skills, stats, recentReviews } = profileData;

  const getLevelBadgeColor = (level) => {
    switch(level) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Expert': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Container className="py-5">
      <Row>
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="mb-4">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '100px', height: '100px' }}>
                  <span className="h1">{teacher.name.charAt(0)}</span>
                </div>
                <h2 className="h3 mb-1">{teacher.name}</h2>
                <p className="text-muted mb-3">{teacher.email}</p>
                <div className="d-flex justify-content-center align-items-center">
                  <div className="me-3">
                    <FaStar className="text-warning me-1" />
                    <span className="fw-bold">{stats.averageRating.toFixed(1)}</span>
                  </div>
                  <div>
                    <FaGraduationCap className="text-secondary me-1" />
                    <span>{stats.reviewCount} reviews</span>
                  </div>
                </div>
              </div>
              
              <Button variant="primary" className="w-100 mb-2">
                Contact Teacher
              </Button>
              <Button variant="primary" className="w-100">
                Book a Session
              </Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h3 className="mb-4">Skills & Expertise</h3>
              {skills.length > 0 ? (
                <Row xs={1} md={2} className="g-3">
                  {skills.map((skill) => (
                    <Col key={skill._id}>
                      <Card className="h-100 border">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="mb-0">{skill.skillName}</h5>
                            <Badge bg={getLevelBadgeColor(skill.proficiencyLevel)}>
                              {skill.proficiencyLevel}
                            </Badge>
                          </div>
                          {skill.description && (
                            <p className="text-muted mb-0 small">{skill.description}</p>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Alert variant="info">No skills listed yet.</Alert>
              )}
            </Card.Body>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h3 className="mb-4">Recent Reviews</h3>
              {recentReviews.length > 0 ? (
                <div>
                  {recentReviews.map((review) => (
                    <div key={review._id} className="mb-4 pb-4 border-bottom">
                      <div className="d-flex justify-content-between mb-2">
                        <div>
                          <h5 className="mb-0">{review.studentId.name}</h5>
                          <p className="text-muted small mb-0">
                            <FaGraduationCap className="me-1" />
                            Learned {review.skillId.skillName}
                          </p>
                        </div>
                        <div className="d-flex align-items-center">
                          <FaStar className="text-warning me-1" />
                          <span className="fw-bold">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-muted mb-2">{review.reviewText || "No additional feedback provided."}</p>
                      <div className="d-flex align-items-center text-muted small">
                        <FaCalendarAlt className="me-1" />
                        <span>
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert variant="info">No reviews yet.</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TeacherProfilePage;