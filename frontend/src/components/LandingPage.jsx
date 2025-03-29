import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaExchangeAlt, FaUserGraduate, FaClock, FaArrowRight, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import CountUp from 'react-countup';
import VisibilitySensor from 'react-visibility-sensor';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import NavbarSearchDropdown from './search/NavbarSearchDropdown';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      mirror: false
    });
  }, []);

  const features = [
    { 
      title: "Free Learning", 
      text: "Exchange skills without any monetary cost, focusing on knowledge sharing rather than financial transactions.", 
      icon: <FaExchangeAlt className="display-4 text-primary mb-4" />
    },
    { 
      title: "Expert Teachers", 
      text: "Learn from experienced professionals who have proven expertise in their respective fields.", 
      icon: <FaUserGraduate className="display-4 text-primary mb-4" />
    },
    { 
      title: "Flexible Schedule", 
      text: "Learn at your own pace and time with our flexible scheduling system that adapts to your lifestyle.", 
      icon: <FaClock className="display-4 text-primary mb-4" />
    }
  ];

  const steps = [
    { 
      step: "1", 
      title: "Sign Up", 
      text: "Create a free account and set up your profile with your skills, interests, and learning goals." 
    },
    { 
      step: "2", 
      title: "Find a Skill", 
      text: "Browse available skills and connect with mentors who match your learning preferences and objectives." 
    },
    { 
      step: "3", 
      title: "Start Learning", 
      text: "Exchange knowledge and enhance your expertise through our structured learning environment." 
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Graphic Designer",
      text: "Skill Barter transformed my career! I learned coding while teaching design, creating a perfect skill exchange.",
      image: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      name: "Michael Chen",
      role: "Software Developer",
      text: "The platform's intuitive design made finding the right mentor easy. Now I'm both learning and teaching!",
      image: "https://randomuser.me/api/portraits/men/44.jpg"
    },
    {
      name: "Priya Sharma",
      role: "Marketing Specialist",
      text: "Skill Barter helped me diversify my skillset while sharing my marketing expertise with others.",
      image: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  ];

  const stats = [
    { value: 15000, label: "Active Users" },
    { value: 500, label: "Expert Mentors" },
    { value: 1200, label: "Skills Available" },
    { value: 98, label: "Satisfaction Rate", suffix: "%" }
  ];

  return (
    <div className="landing-page">
      {/* Navbar */}
      <Navbar expand="lg" className="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm py-3">
        <Container>
          <Navbar.Brand href="#" className="fw-bold fs-4 text-primary">SkillBarter</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarSupportedContent" />
          <Navbar.Collapse id="navbarSupportedContent">
  <Nav className="ms-auto mb-2 mb-lg-0">
    <Nav.Link href="#features" className="mx-2">Features</Nav.Link>
    <Nav.Link href="#how-it-works" className="mx-2">How It Works</Nav.Link>
    <Nav.Link href="#testimonials" className="mx-2">Testimonials</Nav.Link>
    <Nav.Link href="#" className="mx-2">Contact</Nav.Link>
    <Nav.Item className="mx-2">
      <NavbarSearchDropdown />
    </Nav.Item>
  </Nav>
  <div className="d-flex ms-lg-3">
    <Button variant="primary" className="me-2" onClick={() => navigate('/login')}>Login</Button>
    <Button variant="primary" onClick={() => navigate('/register')}>Register</Button>
  </div>
</Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <div className="hero-section position-relative overflow-hidden" 
  style={{ 
    background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)',
    paddingTop: '120px',
    paddingBottom: '120px'
  }}>
  <Container>
    <Row className="align-items-center">
      <Col lg={6} className="text-lg-start text-center pe-lg-5" data-aos="fade-right">
        <div className="mb-5 mb-lg-0">
          <span className="badge bg-white text-primary px-3 py-2 mb-3 fw-bold">LEARN & TEACH</span>
          <h1 className="display-3 fw-bold mb-4 text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            Skill Barter Platform
          </h1>
          <p className="lead fs-4 mb-4 text-white" style={{ opacity: 0.9 }}>
            Exchange skills, grow together. Join our community of learners and teachers to expand your horizons without financial barriers.
          </p>
          <div className="d-flex flex-wrap gap-3 justify-content-lg-start justify-content-center">
            <Button 
              variant="light" 
              size="lg" 
              className="fw-bold px-4 py-3 shadow-sm" 
              onClick={() => navigate('/register')}
            >
              Get Started <FaArrowRight className="ms-2" />
            </Button>
            <Button 
              variant="outline-light" 
              size="lg" 
              className="px-4 py-3 border-2" 
              onClick={() => navigate('/login')}
            >
              Learn More
            </Button>

            {/* <Link to="/search">
  <Button 
    variant="light" 
    size="lg" 
    className="fw-bold px-4 py-3 shadow-sm"
  >
    Find Skills <FaSearch className="ms-2" />
  </Button>
</Link> */}

          </div>
        </div>
      </Col>
      <Col lg={6} data-aos="fade-left">
        <div className="position-relative">
          <div className="hero-image-container p-3 bg-white rounded-lg shadow-lg" 
            style={{ transform: 'rotate(-2deg)' }}>
            <img 
              src={require("../images/skillbarter.png")}
              alt="Hero illustration" 
              className="img-fluid rounded shadow-sm"
              style={{ width: "100%", objectFit: "contain" }}
            />
          </div>
          <div className="position-absolute d-none d-lg-block" 
            style={{ 
              bottom: '-25px', 
              right: '-10px', 
              background: 'rgba(255,255,255,0.2)', 
              width: '180px', 
              height: '180px', 
              borderRadius: '50%', 
              backdropFilter: 'blur(10px)',
              zIndex: '-1'
            }}>
          </div>
          <div className="position-absolute d-none d-lg-block" 
            style={{ 
              top: '-15px', 
              left: '-5px', 
              background: 'rgba(255,255,255,0.15)', 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              backdropFilter: 'blur(7px)',
              zIndex: '-1'
            }}>
          </div>
        </div>
      </Col>
    </Row>
  </Container>
  
  {/* Wave Shape Divider */}
  <div className="position-absolute bottom-0 left-0 w-100 overflow-hidden" style={{ height: '70px', transform: 'translateY(1px)' }}>
    <svg viewBox="0 0 2880 48" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 48h2880V0h-720C1442.5 52 720 0 720 0H0v48z" fill="#ffffff"></path>
    </svg>
  </div>
</div>

      {/* Stats Section */}
      <div className="py-5 bg-white" data-aos="fade-up">
        <Container>
          <Row className="text-center">
            {stats.map((stat, index) => (
              <Col md={3} sm={6} className="mb-4 mb-md-0" key={index}>
                <Card className="border-0 shadow-sm h-100 py-4">
                  <Card.Body>
                    <CountUp end={stat.value} suffix={stat.suffix || ''} redraw={true}>
                      {({ countUpRef, start }) => (
                        <VisibilitySensor onChange={start} delayedCall>
                          <div>
                            <h2 className="display-4 fw-bold text-primary" ref={countUpRef}></h2>
                            <p className="text-muted mb-0">{stat.label}</p>
                          </div>
                        </VisibilitySensor>
                      )}
                    </CountUp>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Why Choose Skill Barter? */}
      <div id="features" className="py-5 bg-light">
        <Container className="py-5">
          <div className="text-center mb-5" data-aos="fade-up">
            <h5 className="text-primary fw-bold">OUR FEATURES</h5>
            <h2 className="display-5 fw-bold mb-4">Why Choose Skill Barter?</h2>
            <div className="mx-auto" style={{ maxWidth: '600px' }}>
              <p className="lead text-muted">Our platform offers unique advantages that make skill exchange efficient, enjoyable, and valuable for everyone involved.</p>
            </div>
          </div>
          <Row className="gy-4">
            {features.map(({ title, text, icon }, index) => (
              <Col lg={4} md={6} key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                <Card className="h-100 shadow border-0 p-4 text-center hover-effect">
                  <Card.Body>
                    <div className="mb-4">
                      {icon}
                    </div>
                    <h3 className="h4 fw-bold mb-3">{title}</h3>
                    <p className="text-muted">{text}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="py-5 bg-white">
        <Container className="py-5">
          <div className="text-center mb-5" data-aos="fade-up">
            <h5 className="text-primary fw-bold">PROCESS</h5>
            <h2 className="display-5 fw-bold mb-4">How It Works?</h2>
            <div className="mx-auto" style={{ maxWidth: '600px' }}>
              <p className="lead text-muted">Getting started is simple. Follow these steps to begin your skill exchange journey.</p>
            </div>
          </div>
          <Row className="gy-4 position-relative">
            {/* Process Connection Line */}
            <div className="process-line d-none d-md-block position-absolute top-50" style={{ height: '2px', backgroundColor: '#dee2e6', width: '75%', left: '12.5%', zIndex: 0 }}></div>
            
            {steps.map(({ step, title, text }, index) => (
              <Col md={4} key={index} data-aos="fade-up" data-aos-delay={index * 150}>
                <Card className="border-0 shadow-sm h-100 position-relative z-1">
                  <div className="position-absolute top-0 start-50 translate-middle">
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                      <span className="h3 mb-0">{step}</span>
                    </div>
                  </div>
                  <Card.Body className="text-center p-5 mt-4">
                    <h3 className="h4 fw-bold mt-3 mb-3">{title}</h3>
                    <p className="text-muted">{text}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Testimonials */}
      <div id="testimonials" className="py-5 bg-light">
        <Container className="py-5">
          <div className="text-center mb-5" data-aos="fade-up">
            <h5 className="text-primary fw-bold">TESTIMONIALS</h5>
            <h2 className="display-5 fw-bold mb-4">What Our Users Say</h2>
            <div className="mx-auto" style={{ maxWidth: '600px' }}>
              <p className="lead text-muted">Discover how Skill Barter has helped people around the world learn new skills and share their expertise.</p>
            </div>
          </div>
          <Row className="gy-4">
            {testimonials.map((testimonial, index) => (
              <Col lg={4} md={6} key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                <Card className="h-100 shadow-sm border-0 p-4 testimonial-card">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-4">
                      <img 
                        src={testimonial.image} 
                        className="rounded-circle" 
                        width="60" 
                        height="60"
                        alt={testimonial.name}
                      />
                      <div className="ms-3">
                        <h4 className="h5 mb-0">{testimonial.name}</h4>
                        <p className="text-muted mb-0">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="bi bi-star-fill text-warning me-1"></i>
                      ))}
                    </div>
                    <p className="fst-italic">{testimonial.text}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* CTA Section */}
      <div className="py-5 bg-primary text-white">
        <Container className="py-5">
          <Row className="align-items-center">
            <Col lg={8} data-aos="fade-right">
              <h2 className="display-4 fw-bold mb-3">Ready to Start Your Journey?</h2>
              <p className="lead mb-4">Join thousands of users who are already exchanging skills and expanding their horizons.</p>
            </Col>
            <Col lg={4} className="text-lg-end" data-aos="fade-left">
              <Button 
                variant="light" 
                size="lg" 
                className="fw-bold primary px-4 py-3"
                onClick={() => navigate('/register')}
              >
                Sign Up Now
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Newsletter */}
      <div className="py-5 bg-white">
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col lg={6} className="text-center" data-aos="fade-up">
              <h2 className="fw-bold mb-4">Subscribe to Our Newsletter</h2>
              <p className="text-muted mb-4">Stay updated with the latest skills, courses, and community news.</p>
              <Form>
                <InputGroup className="mb-3">
                  <Form.Control
                    placeholder="Your email address"
                    aria-label="Your email address"
                    aria-describedby="newsletter-button"
                  />
                  <Button variant="primary" id="newsletter-button">
                    Subscribe
                  </Button>
                </InputGroup>
<Form.Text className="text-muted">
                    We respect your privacy. Unsubscribe at any time.
                  </Form.Text>
                </Form>
              </Col>
            </Row>
          </Container>
        </div>

        {/* Footer */}
        <footer className="bg-dark text-white pt-5 pb-4">
          <Container>
            <Row className="gy-4">
              <Col lg={4} md={6}>
                <h3 className="h4 fw-bold mb-4">SkillBarter</h3>
                <p className="mb-4">Exchange skills, grow together, and build a community of lifelong learners through our innovative skill-sharing platform.</p>
                <div className="d-flex gap-3">
                  <a href="#" className="text-white">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                      <FaFacebookF />
                    </div>
                  </a>
                  <a href="#" className="text-white">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                      <FaTwitter />
                    </div>
                  </a>
                  <a href="#" className="text-white">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                      <FaInstagram />
                    </div>
                  </a>
                  <a href="#" className="text-white">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                      <FaLinkedinIn />
                    </div>
                  </a>
                </div>
              </Col>
              <Col lg={2} md={6}>
                <h5 className="fw-bold mb-4">Quick Links</h5>
                <ul className="list-unstyled">
                  <li className="mb-2"><a href="#" className="text-white text-decoration-none">Home</a></li>
                  <li className="mb-2"><a href="#features" className="text-white text-decoration-none">Features</a></li>
                  <li className="mb-2"><a href="#how-it-works" className="text-white text-decoration-none">How It Works</a></li>
                  <li className="mb-2"><a href="#testimonials" className="text-white text-decoration-none">Testimonials</a></li>
                </ul>
              </Col>
              <Col lg={2} md={6}>
                <h5 className="fw-bold mb-4">Resources</h5>
                <ul className="list-unstyled">
                  <li className="mb-2"><a href="#" className="text-white text-decoration-none">Blog</a></li>
                  <li className="mb-2"><a href="#" className="text-white text-decoration-none">Tutorials</a></li>
                  <li className="mb-2"><a href="#" className="text-white text-decoration-none">FAQs</a></li>
                  <li className="mb-2"><a href="#" className="text-white text-decoration-none">Community</a></li>
                </ul>
              </Col>
              <Col lg={4} md={6}>
                <h5 className="fw-bold mb-4">Contact Us</h5>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <i className="bi bi-geo-alt me-2"></i> 123 Skill Street, Knowledge City
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-envelope me-2"></i> info@skillbarter.com
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-telephone me-2"></i> +1 (555) 123-4567
                  </li>
                </ul>
              </Col>
            </Row>
            <hr className="my-4" />
            <Row>
              <Col className="text-center text-md-start">
                <p className="mb-0">&copy; {new Date().getFullYear()} SkillBarter. All rights reserved.</p>
              </Col>
              <Col className="text-center text-md-end">
                <ul className="list-inline mb-0">
                  <li className="list-inline-item"><a href="#" className="text-white text-decoration-none">Privacy Policy</a></li>
                  <li className="list-inline-item ms-3"><a href="#" className="text-white text-decoration-none">Terms of Service</a></li>
                </ul>
              </Col>
            </Row>
          </Container>
        </footer>

        {/* Back to top button */}
        <button 
          type="button" 
          className="btn btn-primary btn-lg position-fixed bottom-0 end-0 m-4 rounded-circle shadow d-flex align-items-center justify-content-center" 
          style={{ width: '50px', height: '50px', zIndex: 1030 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <i className="bi bi-arrow-up"></i>
        </button>

        {/* Custom CSS */}
        <style jsx="true">{`
          .hover-effect {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .hover-effect:hover {
            transform: translateY(-10px);
            box-shadow: 0 1rem 3rem rgba(0,0,0,.175)!important;
          }
          .testimonial-card {
            transition: all 0.3s ease;
          }
          .testimonial-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
          }
        `}</style>
      </div>
    );
};

export default LandingPage;