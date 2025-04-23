// src/components/shared/constants.js

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// List of countries for the dropdown
export const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "India",
  "Germany", "France", "Japan", "China", "Brazil", "Mexico", "Spain",
  "Italy", "Netherlands", "Sweden", "South Korea", "Russia", "Other"
];

// List of security questions to choose from
export const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "In what city were you born?",
  "What is your mother's maiden name?",
  "What high school did you attend?",
  "What was the make of your first car?",
  "What was your childhood nickname?",
  "What is the name of your favorite childhood friend?",
  "What street did you grow up on?"
];