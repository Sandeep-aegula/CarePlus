import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Patients.css';
import PatientCard from './PatientCard';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: '' });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/patients')
      .then(res => setPatients(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleAddPatient = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/patients/add', newPatient)
      .then(res => {
        setPatients([...patients, res.data]);
        setNewPatient({ name: '', age: '', gender: '' });
      })
      .catch(err => console.error(err));
  };

  const handleUpdatePatient = (id, e) => {
    e.preventDefault();
    axios.post(`http://localhost:5000/patients/update/${id}`, selectedPatient)
      .then(() => {
        const updated = { ...selectedPatient, _id: id };
        setPatients(patients.map(p => (p._id === id ? updated : p)));
        setSelectedPatient(null);
        setIsEditMode(false);
      })
      .catch(err => console.error(err));
  };

  const handleDeletePatient = (id) => {
    axios.delete(`http://localhost:5000/patients/delete/${id}`)
      .then(() => setPatients(patients.filter(p => p._id !== id)))
      .catch(err => console.error(err));
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setIsEditMode(true);
  };

  return (
    <div className="patient-main">
      <div className="form-sections">
        <h4>{isEditMode ? 'Edit Patient' : 'Add New Patient'}</h4>
        <form className="patient-form" onSubmit={isEditMode ? (e) => handleUpdatePatient(selectedPatient._id, e) : handleAddPatient}>
          <div className="patient-grid">
            <div className="field">
              <label>Name</label>
              <input
                type="text"
                placeholder="Full name"
                value={isEditMode ? selectedPatient?.name || '' : newPatient.name}
                onChange={(e) => isEditMode
                  ? setSelectedPatient({ ...selectedPatient, name: e.target.value })
                  : setNewPatient({ ...newPatient, name: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Age</label>
              <input
                type="number"
                placeholder="e.g. 32"
                value={isEditMode ? selectedPatient?.age || '' : newPatient.age}
                onChange={(e) => isEditMode
                  ? setSelectedPatient({ ...selectedPatient, age: e.target.value })
                  : setNewPatient({ ...newPatient, age: e.target.value })}
                required
                min="0"
              />
            </div>

            <div className="field">
              <label>Gender</label>
              <select
                value={isEditMode ? selectedPatient?.gender || '' : newPatient.gender}
                onChange={(e) => isEditMode
                  ? setSelectedPatient({ ...selectedPatient, gender: e.target.value })
                  : setNewPatient({ ...newPatient, gender: e.target.value })}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary">{isEditMode ? 'Update Patient' : 'Add Patient'}</button>
            {isEditMode && <button type="button" className="muted" onClick={() => { setSelectedPatient(null); setIsEditMode(false); }}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="patients-section">
        <h3 style={{ textAlign: 'center' }}>Patients ({patients.length})</h3>
        <div className="patient-list">
          {patients.map(patient => (
            <PatientCard
              key={patient._id}
              patient={patient}
              onEdit={handleEditPatient}
              onDelete={handleDeletePatient}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Patients;
