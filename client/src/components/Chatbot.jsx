import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Send, X, Bot, Minus, Sparkles, User, RefreshCw } from 'lucide-react';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am CarePlus AI. How can I assist you with your health or navigating the platform today?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isTyping, isOpen]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || isTyping) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMessage = { role: 'user', content: input, time };
        
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await axios.post('/chatbot/chat', {
                messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
            });
            
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: res.data.message, 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            }]);
        } catch (err) {
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: 'I am experiencing connection issues. Please try again in a moment.', 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="header-info">
                            <div className="header-status-avatar">
                                <Bot size={22} strokeWidth={2.5} />
                                <span className="status-dot"></span>
                            </div>
                            <div className="header-text">
                                <h4 className="header-title">CarePlus Assistant</h4>
                                <div className="online-badge">
                                    <Sparkles size={12} className="sparkle-icon" />
                                    <span>AI Assistant • Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="header-actions">
                            <button className="header-action-btn minimize" onClick={() => setIsOpen(false)} title="Minimize">
                                <Minus size={20} strokeWidth={2.5} />
                            </button>
                            <button className="header-action-btn close" onClick={() => setIsOpen(false)} title="Close">
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-row ${msg.role}`}>
                                <div className="message-avatar">
                                    {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                                </div>
                                <div className="message-bubble-wrap">
                                    <div className={`message-bubble ${msg.role}`}>
                                        {msg.content}
                                    </div>
                                    <span className="message-time">{msg.time}</span>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message-row assistant typing">
                                <div className="message-avatar"><Bot size={18} /></div>
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-footer">
                        <form className="chat-input-area" onSubmit={handleSend}>
                            <div className="input-field-wrapper">
                                <input
                                    type="text"
                                    className="chat-input"
                                    placeholder="Ask anything..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />
                                <button type="submit" className="send-btn" disabled={isTyping || !input.trim()}>
                                    <Send size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <button 
                className={`chatbot-toggle ${isOpen ? 'active' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Chat"
            >
                {isOpen ? <X size={28} strokeWidth={2.5} /> : (
                    <MessageSquare size={28} strokeWidth={2.5} />
                )}
            </button>
        </div>
    );
};

export default Chatbot;

