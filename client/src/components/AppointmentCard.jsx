import React from 'react';

const AppointmentCard = ({ appointment, onEdit, onDelete }) => {
  return (
    <div className="appointment-card">
      <p><span style={{ fontWeight: 700 }}>Patient:</span> {appointment.patientName}</p>
      <p><span style={{ fontWeight: 700 }}>Doctor:</span> {appointment.doctorName}</p>
      <p><span style={{ fontWeight: 700 }}>Date & Time:</span> {new Date(appointment.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
      <div className="btn-container">
        <button className="muted" onClick={() => onEdit(appointment)}>Edit</button>
        <button className="muted" onClick={() => onDelete(appointment._id)}>Delete</button>
      </div>
    </div>
  );
};

export default AppointmentCard;
