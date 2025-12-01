"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { Button } from "../_components/ui/button";
import { ChevronLeft, Mic, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { Input } from "../_components/ui/input";
import { ChatMessage } from "./_components/chat-messages";

export default function ChatPage() {
    const [message, setMessage] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat'
        })
    })

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = () => {
        if (message.trim()) {
            sendMessage({ text: message });
            setMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-dvh bg-background">
            <header className="flex items-center justify-between px-5 py-4 border-b border-transparent">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <h1 className="text-xl font-serif font-bold italic">Aparatus</h1>
                <div className="w-10" />
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
                <div className="mb-8 mt-4">
                    <div className="border border-border rounded-xl p-4 text-center text-muted-foreground text-sm mb-6">
                        Seu assistente de agendamentos está online.
                    </div>
                    
                    {messages.length === 0 && (
                        <div className="flex gap-3">
                            <div className="shrink-0 bg-muted rounded-full p-2 h-10 w-10 flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-4 text-sm">
                                <p className="font-medium">Olá! Sou o <span className="font-serif italic font-bold">Agenda.ai</span>, seu assistente pessoal.</p>
                                <p>Estou aqui para te auxiliar a agendar seu corte ou barba, encontrar as barbearias disponíveis perto de você e responder às suas dúvidas.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {messages.map(message => (
                        <ChatMessage key={message.id} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="p-5 bg-background">
                <div className="relative flex items-center">
                    <Input 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        onKeyDown={handleKeyDown}
                        placeholder="Digite sua mensagem" 
                        className="pr-24 py-6 rounded-full bg-muted/50 border-none shadow-none focus-visible:ring-0"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                        <Button 
                            onClick={handleSend}
                            size="icon" 
                            className="rounded-full h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}