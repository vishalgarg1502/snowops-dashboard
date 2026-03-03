"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";

/** Lightweight markdown-to-HTML: handles **bold**, * bullets, and line breaks */
function renderMarkdown(text: string): string {
    // Escape HTML
    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Bold **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Convert lines starting with * or - into list items
    const lines = html.split('\n');
    const result: string[] = [];
    let inList = false;
    for (const line of lines) {
        const trimmed = line.trim();
        const bulletMatch = trimmed.match(/^[*\-]\s+(.*)/);
        if (bulletMatch) {
            if (!inList) { result.push('<ul style="margin:4px 0;padding-left:18px;list-style:disc">'); inList = true; }
            result.push(`<li style="margin:2px 0">${bulletMatch[1]}</li>`);
        } else {
            if (inList) { result.push('</ul>'); inList = false; }
            if (trimmed) result.push(`<p style="margin:2px 0">${trimmed}</p>`);
        }
    }
    if (inList) result.push('</ul>');
    return result.join('');
}

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface AskFleetChatProps {
    fleetContext: Record<string, unknown>;
}

const SUGGESTIONS = [
    "Which vehicle has the worst fuel efficiency today?",
    "Which trucks have been idle over 30 minutes?",
    "Summarize today's fleet activity",
    "Which vehicle has the most active faults?",
];

export default function AskFleetChat({ fleetContext }: AskFleetChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content:
                "Hi! I'm SnowOps Assistant. Ask me anything about your Oakville fleet — locations, fuel efficiency, idle time, or alerts.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll only the chat container, not the whole page
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    async function sendMessage(text: string) {
        if (!text.trim() || loading) return;
        const question = text.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: question }]);
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, context: fleetContext }),
            });
            const data = await res.json();
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.answer || data.error || "No response." },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Error connecting to Gemini. Check your API key." },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                        <div
                            className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${msg.role === "assistant"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-600 text-white"
                                }`}
                        >
                            {msg.role === "assistant" ? (
                                <Bot className="w-4 h-4" />
                            ) : (
                                <User className="w-4 h-4" />
                            )}
                        </div>
                        <div
                            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${msg.role === "assistant"
                                ? "bg-slate-800 text-slate-200"
                                : "bg-blue-600 text-white"
                                }`}
                            dangerouslySetInnerHTML={
                                msg.role === "assistant"
                                    ? { __html: renderMarkdown(msg.content) }
                                    : undefined
                            }
                        >
                            {msg.role === "user" ? msg.content : undefined}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-slate-800 rounded-xl px-3 py-2">
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((s) => (
                        <button
                            key={s}
                            onClick={() => sendMessage(s)}
                            className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full px-3 py-1 transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); sendMessage(input); } }}
                    placeholder="Ask your fleet..."
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl px-3 py-2 transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
