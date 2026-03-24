const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Link to auth user
  type: { type: String, enum: ['doctor', 'lab'], required: true },
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  clinicName: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String },
  
  // Geolocation for $near queries
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },

  specialty: { type: String }, // For Doctors
  consultationFee: { type: Number, default: 0 }, // Doctor consultation price
  isAvailable: { type: Boolean, default: false }, // Live status for doctors
  
  labTests: [{ type: String }], // For Labs
  services: [{ 
    name: String, 
    price: Number,
    tat: String,           // Turn-around time e.g., "12 hrs"
    homeCollection: { type: Boolean, default: false }
  }],
  
  isLive: { type: Boolean, default: false },
  availability: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    startTime: { type: String },  // e.g. "09:00"
    endTime: { type: String }     // e.g. "17:00"
  }],

  // Ratings
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  reviews: [{
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now },
    patientName: String
  }]
}, { timestamps: true });

providerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Provider', providerSchema);
