import React, { useMemo } from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { GeoAltFill, EnvelopeFill, MortarboardFill, BookFill, 
  PeopleFill, StarFill } from 'react-bootstrap-icons';

const ProfileCard = ({ profile }) => {
  // Calculate number of skills
  const teachingSkillCount = useMemo(() => 
    profile?.teachingSkills ? profile.teachingSkills.length : 0,
    [profile?.teachingSkills]
  );
  
  const learningSkillCount = useMemo(() => 
    profile?.learningSkills ? profile.learningSkills.length : 0,
    [profile?.learningSkills]
  );
  
  // Generate teaching status based on skill count
  const teachingStatus = useMemo(() => 
    teachingSkillCount > 5 ? 'Expert' : teachingSkillCount > 2 ? 'Intermediate' : 'Beginner',
    [teachingSkillCount]
  );
  
  // Generate learning status based on skill count
  const learningStatus = useMemo(() => 
    learningSkillCount > 5 ? 'Enthusiast' : learningSkillCount > 2 ? 'Active' : 'Exploring',
    [learningSkillCount]
  );

  // Function to get user's initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate avatar color based on name
  const avatarColor = useMemo(() => {
    if (!profile?.name) return 'hsl(210, 70%, 65%)';
    const charCode = profile.name.charCodeAt(0);
    return `hsl(${(charCode * 70) % 360}, 70%, 65%)`;
  }, [profile?.name]);

  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
      <Card.Body className="p-0">
        <Row className="g-0">
          {/* Column 1: User Info */}
          <Col md={4} className="border-end" style={{ background: '#f8fafc' }}>
            <div className="p-4 h-100 d-flex flex-column">
              {/* User Avatar and Name */}
              <div className="text-center mb-4">
                <div className="position-relative d-inline-block mb-3">
                  {/* Avatar Circle */}
                  <div className="rounded-circle d-flex align-items-center justify-content-center border-0 mx-auto" 
                      style={{ 
                        width: '110px', 
                        height: '110px', 
                        background: avatarColor,
                        boxShadow: '0 0 0 5px rgba(255, 255, 255, 0.8), 0 0 0 10px rgba(59, 130, 246, 0.1)'
                      }}>
                    <h2 className="mb-0 fw-bold text-white" style={{ fontSize: '2.5rem' }}>{getInitials(profile?.name)}</h2>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="position-absolute top-0 end-0 translate-middle">
                    <div className="bg-success rounded-circle p-1 shadow-lg" style={{ border: '2px solid white' }}>
                      <StarFill className="text-white" size={22} />
                    </div>
                  </div>
                </div>
                
                <h4 className="fw-bold mb-1" style={{ color: '#1e40af' }}>{profile?.name || 'User Name'}</h4>
                
                {/* Location Badge */}
                {profile?.country && (
                  <div className="d-flex align-items-center justify-content-center mb-3">
                    <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
                      style={{ 
                        width: '24px', 
                        height: '24px', 
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6'
                      }}>
                      <GeoAltFill size={12} />
                    </div>
                    <span className="text-muted">{profile.country}</span>
                  </div>
                )}
              </div>
              
              {/* Contact Information */}
              <div className="mb-4">
                <h6 className="text-uppercase fw-semibold small mb-3" style={{ color: '#64748b', letterSpacing: '1px' }}>Contact Information</h6>
                
                {/* Email */}
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3 rounded-circle d-flex align-items-center justify-content-center" 
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                      color: 'white'
                    }}>
                    <EnvelopeFill size={18} />
                  </div>
                  <div>
                    <div className="small text-muted">Email</div>
                    <div className="fw-semibold">{profile?.email || 'email@example.com'}</div>
                  </div>
                </div>
                
                {/* Community Status */}
                <div className="d-flex align-items-center">
                  <div className="me-3 rounded-circle d-flex align-items-center justify-content-center" 
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      background: 'linear-gradient(135deg, #10b981, #047857)',
                      color: 'white'
                    }}>
                    <PeopleFill size={18} />
                  </div>
                  <div>
                    <div className="small text-muted">Community Status</div>
                    <div className="fw-semibold">Active Member</div>
                  </div>
                </div>
              </div>
              
              {/* Activity Status Card */}
              <div className="mt-auto">
                <Card className="border-0 rounded-4 shadow-sm" style={{ 
                  background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)',
                  overflow: 'hidden'
                }}>
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center mb-2">
                      <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
                        style={{ 
                          width: '28px', 
                          height: '28px', 
                          background: '#0ea5e9',
                          color: 'white'
                        }}>
                        <StarFill size={14} />
                      </div>
                      <h6 className="text-uppercase fw-semibold small mb-0" style={{ color: '#0c4a6e' }}>Profile Status</h6>
                    </div>
                    <p className="small mb-0 text-muted">Your profile is visible to the community. You're ready to connect with study partners!</p>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </Col>
          
          {/* Column 2: Skill Information */}
          <Col md={8}>
            <div className="p-4 h-100 d-flex flex-column">
              {/* Teaching Skills Section */}
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" 
                         style={{ 
                           width: '48px', 
                           height: '48px', 
                           background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                           boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                         }}>
                      <MortarboardFill size={22} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0" style={{ color: '#1e40af' }}>Teaching Skills</h5>
                    <p className="text-muted small mb-0">{teachingSkillCount} skills · {teachingStatus}</p>
                  </div>
                </div>
                
                {/* Skills List */}
                <div className="ms-5 ps-4">
                  <div className="mb-3">
                    <div className="d-flex flex-wrap gap-2">
                      {profile?.teachingSkills && profile.teachingSkills.length > 0 ? (
                        profile.teachingSkills.map((skill, index) => (
                          <span key={`teach-${index}`} className="badge rounded-pill" 
                            style={{ 
                              background: 'rgba(59, 130, 246, 0.1)', 
                              color: '#3b82f6',
                              border: '1px solid rgba(59, 130, 246, 0.2)',
                              padding: '0.5rem 1rem',
                              fontSize: '0.9rem'
                            }}>
                            {skill.skillName}
                            <div className="d-flex align-items-center ms-2 ps-2 border-start border-primary border-opacity-25">
                              <StarFill size={10} className="me-1" />
                              <span>{skill.proficiencyLevel || 3}</span>
                            </div>
                          </span>
                        ))
                      ) : (
                        <p className="text-muted fst-italic small">No teaching skills added yet</p>
                      )}
                    </div>
                  </div>

                  {/* Proficiency Legend */}
                  <div className="d-flex align-items-center">
                    <span className="me-3 small text-muted">Proficiency:</span>
                    <div className="d-flex gap-3">
                      <div className="d-flex align-items-center">
                        <StarFill size={10} className="me-1 text-primary" />
                        <span className="small text-muted">Beginner</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="d-flex me-1">
                          <StarFill size={10} className="text-primary" />
                          <StarFill size={10} className="text-primary" />
                        </div>
                        <span className="small text-muted">Intermediate</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="d-flex me-1">
                          <StarFill size={10} className="text-primary" />
                          <StarFill size={10} className="text-primary" />
                          <StarFill size={10} className="text-primary" />
                        </div>
                        <span className="small text-muted">Advanced</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Divider */}
              <hr className="my-4" style={{ background: 'rgba(203, 213, 225, 0.5)' }} />
              
              {/* Learning Skills Section */}
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" 
                         style={{ 
                           width: '48px', 
                           height: '48px', 
                           background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                           boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.3)'
                         }}>
                      <BookFill size={22} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0" style={{ color: '#0891b2' }}>Learning Skills</h5>
                    <p className="text-muted small mb-0">{learningSkillCount} skills · {learningStatus}</p>
                  </div>
                </div>
                
                {/* Skills List */}
                <div className="ms-5 ps-4">
                  <div className="mb-3">
                    <div className="d-flex flex-wrap gap-2">
                      {profile?.learningSkills && profile.learningSkills.length > 0 ? (
                        profile.learningSkills.map((skill, index) => (
                          <span key={`learn-${index}`} className="badge rounded-pill" 
                            style={{ 
                              background: 'rgba(6, 182, 212, 0.1)', 
                              color: '#0891b2',
                              border: '1px solid rgba(6, 182, 212, 0.2)',
                              padding: '0.5rem 1rem',
                              fontSize: '0.9rem'
                            }}>
                            {skill.skillName}
                            <div className="d-flex align-items-center ms-2 ps-2 border-start border-info border-opacity-25">
                              <StarFill size={10} className="me-1" />
                              <span>{skill.proficiencyLevel || 1}</span>
                            </div>
                          </span>
                        ))
                      ) : (
                        <p className="text-muted fst-italic small">No learning skills added yet</p>
                      )}
                    </div>
                  </div>

                  {/* Interest Legend */}
                  <div className="d-flex align-items-center">
                    <span className="me-3 small text-muted">Interest Level:</span>
                    <div className="d-flex gap-3">
                      <div className="d-flex align-items-center">
                        <StarFill size={10} className="me-1 text-info" />
                        <span className="small text-muted">Curious</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="d-flex me-1">
                          <StarFill size={10} className="text-info" />
                          <StarFill size={10} className="text-info" />
                        </div>
                        <span className="small text-muted">Interested</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="d-flex me-1">
                          <StarFill size={10} className="text-info" />
                          <StarFill size={10} className="text-info" />
                          <StarFill size={10} className="text-info" />
                        </div>
                        <span className="small text-muted">Passionate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Information Card */}
              <div className="mt-auto">
                <Card className="border-0 rounded-4" style={{ 
                  background: 'linear-gradient(to right, #f1f5f9, #f8fafc)',
                  borderLeft: '4px solid #3b82f6'
                }}>
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center mb-1">
                      <h6 className="fw-semibold mb-0">Match Compatibility</h6>
                      <Badge bg="primary" className="ms-2 rounded-pill" style={{ 
                        background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                      }}>High</Badge>
                    </div>
                    <p className="small mb-0 text-muted">
                      Your profile has a balanced mix of teaching and learning skills, increasing your 
                      potential for successful study partnerships.
                    </p>
                  </Card.Body>
                </Card>
              </div>
              
              {/* Animation Styles */}
              <style>
                {`
                @keyframes pulse {
                  0% { opacity: 0.6; }
                  50% { opacity: 1; }
                  100% { opacity: 0.6; }
                }
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(-10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                `}
              </style>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ProfileCard;