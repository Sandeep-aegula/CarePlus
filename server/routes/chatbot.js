const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const { auth } = require('../middleware/auth');

const getGroqClient = () => {
    const apiKey = process.env.GROQ_API || process.env.GROQ_API_KEY;
    if (!apiKey) return null;
    return new Groq({ apiKey });
};

const SYSTEM_PROMPT = `
You are CarePlus AI, the official medical assistant for CarePlus Hospital. 
Your goal is to help users with medical inquiries, health advice, and navigating the CarePlus application.

ABOUT CAREPLUS APPLICATION & FLOW:
1. PUBLIC DASHBOARD: The landing page showing hospital statistics (Total Doctors, Patients, Appointments, and Live Online Users).
2. USER ROLES:
   - PATIENTS: Can access 'My Health Area' to view their medical history and book appointments.
   - DOCTORS: Can access 'Doctor Portal' to manage their schedule and patient appointments.
3. HOW TO BOOK AN APPOINTMENT (Patient Flow):
   - Go to 'My Health Area'.
   - Click the 'Schedule' button at the bottom right.
   - Select a medical specialty (e.g., Cardiology, Pediatrics).
   - Select a specific doctor from the filtered list.
   - Choose a date/time and describe symptoms.
   - Confirm to send the request to the doctor.
4. HOW DOCTORS MANAGE APPOINTMENTS:
   - Go to 'Doctor Portal'.
   - View 'Recent Appointments'.
   - 'Confirm' or 'Cancel' pending requests.
   - Mark confirmed appointments as 'Completed' once the visit is over.

GUIDELINES:
- Be professional, empathetic, and concise.
- For medical questions, provide helpful advice but always remind users to consult with a CarePlus specialist for a definitive diagnosis.
- If a user is confused about how to use the app, explain the steps clearly based on their role.
- Support both English and the user's preferred language if they ask.
- If a user asks who you are, identify as CarePlus Assistant.
`;

// @route   POST /api/chatbot/chat
// @desc    Get AI response from Groq
router.post('/chat', async (req, res) => {
    const { messages } = req.body;
    console.log('Incoming chat request. Messages count:', messages.length);

    try {
        const groq = getGroqClient();
        if (!groq) {
            throw new Error('GROQ API key is missing in environment variables');
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 1024,
        });

        console.log('AI response received successfully');
        res.json({ message: chatCompletion.choices[0].message.content });
    } catch (err) {
        console.error('GROQ CHATBOT ERROR:', err.message);
        res.status(500).json({ msg: 'AI Assistant is temporarily unavailable', error: err.message });
    }
});

module.exports = router;
