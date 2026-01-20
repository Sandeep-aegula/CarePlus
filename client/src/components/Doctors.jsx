import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DoctorCard from './DoctorCard';
import './Doctors.css';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [newDoctor, setNewDoctor] = useState({ name: '', specialty: '' });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/doctors')
      .then(res => setDoctors(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleAddDoctor = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/doctors/add', newDoctor)
      .then(res => {
        setDoctors([...doctors, res.data]);
        setNewDoctor({ name: '', specialty: '' });
      })
      .catch(err => console.error(err));
  };

  const handleUpdateDoctor = (id, e) => {
    e.preventDefault();
    axios.post(`http://localhost:5000/doctors/update/${id}`, selectedDoctor)
      .then(() => {
        const updated = { ...selectedDoctor, _id: id };
        setDoctors(doctors.map(d => (d._id === id ? updated : d)));
        setSelectedDoctor(null);
        setIsEditMode(false);
      })
      .catch(err => console.error(err));
  };

  const handleDeleteDoctor = (id) => {
    axios.delete(`http://localhost:5000/doctors/delete/${id}`)
      .then(() => setDoctors(doctors.filter(d => d._id !== id)))
      .catch(err => console.error(err));
  };

  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setIsEditMode(true);
  };

  return (
    <div className="main-doc-container">
      <div className="form-sections">
        <h4>{isEditMode ? 'Edit Doctor' : 'Add New Doctor'}</h4>
        <form className="doctor-form" onSubmit={isEditMode ? (e) => handleUpdateDoctor(selectedDoctor._id, e) : handleAddDoctor}>
          <div className="doctor-grid">
            <div className="field">
              <label>Name</label>
              <input
                type="text"
                placeholder="e.g. Dr. A. Smith"
                value={isEditMode ? selectedDoctor?.name || '' : newDoctor.name}
                onChange={(e) => isEditMode
                  ? setSelectedDoctor({ ...selectedDoctor, name: e.target.value })
                  : setNewDoctor({ ...newDoctor, name: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Specialty</label>
              <input
                type="text"
                placeholder="e.g. Cardiology"
                value={isEditMode ? selectedDoctor?.specialty || '' : newDoctor.specialty}
                onChange={(e) => isEditMode
                  ? setSelectedDoctor({ ...selectedDoctor, specialty: e.target.value })
                  : setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary">{isEditMode ? 'Update Doctor' : 'Add Doctor'}</button>
            {isEditMode && <button type="button" className="muted" onClick={() => { setSelectedDoctor(null); setIsEditMode(false); }}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="doctors-section">
        <h3>Doctors ({doctors.length})</h3>
        <div className="doctor-list">
          {doctors.map(doctor => (
            <DoctorCard
              key={doctor._id}
              doctor={doctor}
              onEdit={handleEditDoctor}
              onDelete={handleDeleteDoctor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
