import React, { useState } from 'react';
 import { Form, InputGroup, Button, Dropdown } from 'react-bootstrap';
 import { FaSearch } from 'react-icons/fa';
 import { useNavigate } from 'react-router-dom';
 
 const NavbarSearchDropdown = () => {
   const [searchParams, setSearchParams] = useState({
     query: '',
     skillLevel: ''
   });
   const navigate = useNavigate();
 
   const handleChange = (e) => {
     const { name, value } = e.target;
     setSearchParams(prev => ({
       ...prev,
       [name]: value
     }));
   };
 
   const handleSubmit = (e) => {
     e.preventDefault();
     
     // Create query string
     const queryParams = new URLSearchParams();
     
     if (searchParams.query) {
       queryParams.append('query', searchParams.query);
     }
     
     if (searchParams.skillLevel) {
       queryParams.append('skillLevel', searchParams.skillLevel);
     }
     
     // Navigate to search page with search parameters
     navigate(`/search?${queryParams.toString()}`);
   };
 
   return (
     <Dropdown>
       <Dropdown.Toggle 
         as={Button} 
         variant="light" 
         id="dropdown-search"
         className="d-flex align-items-center"
       >
         <FaSearch className="me-2" />
         <span>Find Skills</span>
       </Dropdown.Toggle>
 
       <Dropdown.Menu 
         className="p-3 shadow-sm" 
         style={{ width: '300px' }}
       >
         <Form onSubmit={handleSubmit}>
           <InputGroup className="mb-3">
             <Form.Control
               type="text"
               placeholder="Search skills or teachers..."
               name="query"
               value={searchParams.query}
               onChange={handleChange}
               autoFocus
             />
           </InputGroup>
 
           <Form.Group className="mb-3">
             <Form.Label className="small fw-bold">Skill Level</Form.Label>
             <Form.Select
               name="skillLevel"
               value={searchParams.skillLevel}
               onChange={handleChange}
               aria-label="Skill Level"
               size="sm"
             >
               <option value="">All Skill Levels</option>
               <option value="Beginner">Beginner</option>
               <option value="Intermediate">Intermediate</option>
               <option value="Expert">Expert</option>
             </Form.Select>
           </Form.Group>
 
           <Button 
             variant="primary" 
             type="submit" 
             className="w-100"
           >
             Search
           </Button>
         </Form>
       </Dropdown.Menu>
     </Dropdown>
   );
 };
 
 export default NavbarSearchDropdown;