import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    medicalInfo: {
      bloodType: '',
      allergies: '',
      medications: '',
      conditions: ''
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Process medical info arrays
    const processedData = {
      ...formData,
      medicalInfo: {
        ...formData.medicalInfo,
        allergies: formData.medicalInfo.allergies.split(',').map(item => item.trim()).filter(item => item),
        medications: formData.medicalInfo.medications.split(',').map(item => item.trim()).filter(item => item),
        conditions: formData.medicalInfo.conditions.split(',').map(item => item.trim()).filter(item => item)
      }
    };

    const result = await register(processedData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card signup-card">
        <h2>Sign Up for Hack4Health</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Emergency Contact</h3>
            <div className="form-group">
              <label htmlFor="emergencyContact.name">Contact Name</label>
              <input
                type="text"
                id="emergencyContact.name"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="emergencyContact.phone">Contact Phone</label>
              <input
                type="tel"
                id="emergencyContact.phone"
                name="emergencyContact.phone"
                value={formData.emergencyContact.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="emergencyContact.relationship">Relationship</label>
              <input
                type="text"
                id="emergencyContact.relationship"
                name="emergencyContact.relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Medical Information (Optional)</h3>
            <div className="form-group">
              <label htmlFor="medicalInfo.bloodType">Blood Type</label>
              <select
                id="medicalInfo.bloodType"
                name="medicalInfo.bloodType"
                value={formData.medicalInfo.bloodType}
                onChange={handleChange}
              >
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="medicalInfo.allergies">Allergies (comma-separated)</label>
              <input
                type="text"
                id="medicalInfo.allergies"
                name="medicalInfo.allergies"
                value={formData.medicalInfo.allergies}
                onChange={handleChange}
                placeholder="e.g., Peanuts, Shellfish"
              />
            </div>

            <div className="form-group">
              <label htmlFor="medicalInfo.medications">Current Medications (comma-separated)</label>
              <input
                type="text"
                id="medicalInfo.medications"
                name="medicalInfo.medications"
                value={formData.medicalInfo.medications}
                onChange={handleChange}
                placeholder="e.g., Aspirin, Insulin"
              />
            </div>

            <div className="form-group">
              <label htmlFor="medicalInfo.conditions">Medical Conditions (comma-separated)</label>
              <input
                type="text"
                id="medicalInfo.conditions"
                name="medicalInfo.conditions"
                value={formData.medicalInfo.conditions}
                onChange={handleChange}
                placeholder="e.g., Diabetes, Hypertension"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
