import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { 
  ClipboardCheck, 
  Inbox, 
  CheckCircle, 
  ArrowRight 
} from 'react-bootstrap-icons';

const AssessmentStats = ({ stats }) => {
  // Function to format stats safely
  const formatStat = (value, isPercentage = false) => {
    if (value === null || value === undefined) return isPercentage ? '0%' : '0';
    if (isPercentage) {
      // Format as percentage with one decimal place
      return `${parseFloat(value).toFixed(1)}%`;
    }
    return value.toString();
  };

  const statItems = [
    {
      title: "Total Assessments",
      value: formatStat(stats.totalAssessments),
      icon: <ClipboardCheck />,
      color: "#4f46e5",
      bgColor: "rgba(79, 70, 229, 0.1)"
    },
    {
      title: "Pending Review",
      value: formatStat(stats.pendingSubmissions),
      icon: <Inbox />,
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.1)"
    },
    {
      title: "Teaching Sessions",
      value: formatStat(stats.totalCompletedSessions),
      icon: <CheckCircle />,
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.1)"
    },
    {
      title: "Avg. Score",
      value: formatStat(stats.averageScore, true),
      icon: <ArrowRight />,
      color: "#06b6d4",
      bgColor: "rgba(6, 182, 212, 0.1)"
    }
  ];

  return (
    <Row className="g-3">
      {statItems.map((item, index) => (
        <Col xs={6} md={3} key={index}>
          <div className="p-3 rounded-4" style={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    background: 'rgba(255, 255, 255, 0.2)'
                  }}>
                {item.icon}
              </div>
              <span className="text-white-50 small">{item.title}</span>
            </div>
            <h3 className="fw-bold mb-0 text-white">{item.value}</h3>
          </div>
        </Col>
      ))}
    </Row>
  );
};

export default AssessmentStats;