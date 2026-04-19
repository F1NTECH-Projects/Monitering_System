"use client";
import { useEffect, useState, useRef } from "react";
import { Send, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface Message {
  _id?: string;
  sender: string;
  sender_type: "patient" | "clinic";
  text: string;
  timestamp: string;
}

export default function PatientChat({ appointmentId, isClinic = false }: { appointmentId: string, isClinic?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const ws = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Fetch initial history
    async function fetchHistory() {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const res = await axios.get(`${url}/chat/${appointmentId}/history`);
        setMessages(res.data.messages);
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    }
    fetchHistory();
  }, [appointmentId]);

  useEffect(() => {
    if (!isOpen) return;

    // Connect WebSocket
    const wsUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace("http", "ws");
    ws.current = new WebSocket(`${wsUrl}/chat/${appointmentId}`);

    ws.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => {
          // Prevent duplicates if we already appended optimistically
          if (prev.some((m) => m._id === msg._id && msg._id)) return prev;
          return [...prev, msg];
        });
      } catch (e) {
        // ignore
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [appointmentId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const payload = {
      sender: isClinic ? "Clinic" : "Patient",
      sender_type: isClinic ? "clinic" : "patient",
      text: text.trim()
    };

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(payload));
    }
    setText("");
  };

  return (
    <div className="w-full relative mt-6">
      <AnimatePresence>
        {!isOpen ? (
          <motion.div 
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
             className="flex justify-center"
          >
             <button
               onClick={() => setIsOpen(true)}
               className="btn btn-outline gap-2 bg-[rgba(99,102,241,0.1)] border-[rgba(99,102,241,0.2)] text-[#818cf8]"
             >
               <MessageSquare size={16} /> Live Chat
             </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }}
            className="glass-card flex flex-col h-[400px] border border-[rgba(255,255,255,0.05)] overflow-hidden"
          >
            <div className="bg-[rgba(255,255,255,0.03)] p-3 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <MessageSquare size={14} className="text-[#818cf8]" />
                 <span className="text-sm font-semibold text-white">Live Chat with {isClinic ? "Patient" : "Clinic"}</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[var(--fg-muted)] hover:text-white text-xs font-medium">Close</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-xs text-[var(--fg-muted)] mt-10">Say hello! Messages are encrypted.</div>
              ) : (
                messages.map((m, i) => {
                  const isMine = m.sender_type === (isClinic ? "clinic" : "patient");
                  return (
                    <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div 
                         className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                           isMine 
                             ? "bg-gradient-to-br from-[#6366f1] to-[#a78bfa] text-white rounded-tr-sm" 
                             : "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] text-gray-200 rounded-tl-sm"
                         }`}
                      >
                         {m.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>
            
            <form onSubmit={handleSend} className="p-3 bg-[rgba(0,0,0,0.2)] border-t border-[rgba(255,255,255,0.05)] flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[rgba(99,102,241,0.5)] transition-colors"
                autoFocus
              />
              <button 
                type="submit" 
                disabled={!text.trim()}
                className="w-10 h-10 rounded-xl bg-[#6366f1] flex items-center justify-center text-white disabled:opacity-50 disabled:bg-[rgba(255,255,255,0.1)] transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
