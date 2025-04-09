import React from 'react';
 import { Card, Badge, Button } from 'react-bootstrap';
 import { FaStar, FaUser, FaGraduationCap } from 'react-icons/fa';
 import { useNavigate } from 'react-router-dom';
 
 const SkillCard = ({ skill }) => {
   const navigate = useNavigate();
   
   const getLevelBadgeColor = (level) => {
     switch(level) {
       case 'Beginner':
         return 'success';
       case 'Intermediate':
         return 'warning';
       case 'Expert':
         return 'danger';
       default:
         return 'secondary';
     }
   };
   
   const viewProfile = () => {
     navigate(`/teacher/${skill.teacherId}`);
   };
   
   return (
     <Card className="skill-card h-100 shadow-sm border-0 hover-effect">
       <Card.Body>
         <div className="d-flex justify-content-between align-items-center mb-3">
           <h4 className="mb-0 text-primary">{skill.skillName}</h4>
           <Badge 
             bg={getLevelBadgeColor(skill.proficiencyLevel)}
             className="px-3 py-2"
           >
             {skill.proficiencyLevel}
           </Badge>
         </div>
         
         <div className="mb-3">
           <div className="d-flex align-items-center">
             <FaUser className="text-secondary me-2" />
             <span className="fw-bold">{skill.teacherName}</span>
           </div>
           
           <div className="d-flex align-items-center mt-2">
             <div className="me-3">
               <FaStar className="text-warning me-1" />
               <span className="fw-bold">{skill.averageRating.toFixed(1)}</span>
             </div>
             <div>
               <FaGraduationCap className="text-secondary me-1" />
               <span>{skill.reviewCount} reviews</span>
             </div>
           </div>
         </div>
         
         {skill.description && (
           <Card.Text className="text-muted mb-3">
             {skill.description.length > 100 
               ? `${skill.description.substring(0, 100)}...` 
               : skill.description}
           </Card.Text>
         )}
         
         <div className="text-end">
           <Button 
             variant="primary" 
             onClick={viewProfile}
           >
             View Profile
           </Button>
         </div>
       </Card.Body>
     </Card>
   );
 };
 
 export default SkillCard;