import React from 'react';
import { useNavigate } from 'react-router-dom';

const PatientCard = ({ patient, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleBookAppointment = () => {
    navigate('/appointments', { state: { patientName: patient.name } });
  };

  return (
    <div className="patient-card">
      <h4>{patient.name}</h4>
      <p>Age: {patient.age}</p>
      <p>Gender: {patient.gender}</p>
      <div className="btn-container" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <button className="primary" onClick={handleBookAppointment}>Book Appointment</button>
        <div style={{ display: 'flex', gap: '5px', width: '100%' }}>
          <button style={{ flex: 1 }} onClick={() => onEdit(patient)}>Edit</button>
          <button style={{ flex: 1 }} onClick={() => onDelete(patient._id)}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default PatientCard;
