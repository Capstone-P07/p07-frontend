"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import { parseFallbackField } from "next/dist/lib/fallback";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [faqs, setFaqs] = useState<string[]>([]);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    const initSession = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers: any = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        if (params.id === "new") {
          const res = await api.post("/sessions", {}, { headers });
          const newSessionId = res.data.data.sessionId;
          setSessionId(newSessionId);
          router.replace(`/chat/${newSessionId}`);
        } else {
          setSessionId(params.id as string);
        }
      } catch {
        router.replace("/chatlog");
      }
    };
    initSession();
  }, [params.id, router]);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await api.get('/search/faq?limit=3');
        const questions = res.data.data.faqs.map((f: any) => f.question);
        setFaqs(questions);
      } catch {
        setFaqs([]); // 실패해도 빈 배열로 처리
      }
    };
    fetchFaqs();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleSend = async (directMessage?: string) => {
    
    const userMessage = directMessage?.trim() || message.trim();
    if (!userMessage || !sessionId || isStreaming) return;
    
    setMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsStreaming(true);

    try {
      const token = localStorage.getItem("accessToken");
      const headers: any = {
        Accept: "text/event-stream",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/message/${sessionId}`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.replace("data: ", "").trim();
            if (!data) continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'chunk' && parsed.text) {
                assistantMessage += parsed.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: assistantMessage };
                  return updated;
                });
              }

              if(parsed.type === 'done'){
                break;
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "오류가 발생했습니다. 다시 시도해주세요." }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) console.log("파일 선택:", file.name);
    setShowAttachMenu(false);
  };

  const closeAttachMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowAttachMenu(false);
      setIsClosing(false);
    }, 300);
  };


  return (
    <main className="relative w-[400px] h-[760px] bg-[#f0f0ff] font-sans flex flex-col">
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 z-20 h-[70px] shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center">
            <div className="w-6 h-6 bg-black" style={{ maskImage: 'url(/icons/back.svg)', WebkitMaskImage: 'url(/icons/back.svg)', maskSize: 'contain', WebkitMaskSize: 'contain' }} />
          </button>
          <div className="relative w-9 h-9">
            <Image src="/logo.svg" alt="Riido" fill className="object-contain" priority />
          </div>
          <h1 className="text-[18px] font-bold text-black tracking-tight flex items-center h-full">뤼이도 Riido</h1>
        </div>
        <div className="w-10 h-10 flex items-center justify-center mr-1">
          <div className="w-8 h-8 bg-[#959595]" 
            style={{ maskImage: 'url(/icons/icon-profile.svg)', WebkitMaskImage: 'url(/icons/icon-profile.svg)', maskSize: 'contain', WebkitMaskSize: 'contain' }} 
            onClick={() => router.push(`/login?redirect=/chat/${sessionId}`)} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="bg-white rounded-tr-[30px] rounded-br-[30px] rounded-bl-[30px] p-6 shadow-sm w-[310px]">
            <p className="text-[14px] leading-relaxed text-[#3a3a3a] font-medium">
              사용 중 궁금한 점이 있으신가요? 언제든지 질문 해주세요 😉
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "user" ? (
              <div className="bg-[#5745ff] text-white px-6 py-3.5 rounded-[22px] text-[14px] font-bold shadow-md max-w-[280px]">
                {msg.content}
              </div>
            ) : (
              <div className="bg-white rounded-tr-[30px] rounded-br-[30px] rounded-bl-[30px] p-6 shadow-sm max-w-[310px]">
                <p className="text-[14px] leading-relaxed text-[#3a3a3a] font-medium">
                  {msg.content}
                  {isStreaming && i === messages.length - 1 && (
                    <span className="inline-block w-1 h-4 bg-gray-400 animate-pulse ml-1" />
                  )}
                </p>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <footer className="bg-white p-4 flex items-center gap-3 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.02)] z-20 h-[63px]">
        <button
          onClick={() => showAttachMenu ? closeAttachMenu() : setShowAttachMenu(true)}
          className="w-6 h-6 flex items-center justify-center ml-[15px]"
        >
          <div className="w-6 h-6 bg-[#5745ff]" style={{ maskImage: 'url(/icons/icon-grid.svg)', WebkitMaskImage: 'url(/icons/icon-grid.svg)', maskSize: 'contain', WebkitMaskSize: 'contain' }} />
        </button>
        <div className="flex-1 h-[42px] bg-[#f2f2f2] rounded-full flex items-center px-5">
          <input
            ref={messageInputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="메세지를 입력하세요."
            className="w-full bg-transparent text-[14px] font-medium outline-none placeholder-[#979292]"
          />
        </div>
        <button 
          onClick={ () => handleSend() } 
          disabled = {isStreaming}
          className="w-6 h-6 flex items-center justify-center mr-[13px]">
          <div 
            className={`w-6 h-6 ${isStreaming ? 'bg-gray-300' : 'bg-[#5745ff]'}`} 
            style={{ maskImage: 'url(/icons/icon-send.svg)', WebkitMaskImage: 'url(/icons/icon-send.svg)', maskSize: 'contain', WebkitMaskSize: 'contain' }} />
        </button>
      </footer>

      {showAttachMenu && (
        <>
          <div className={`absolute bottom-[63px] left-0 right-0 z-40 bg-white rounded-t-[20px] ${isClosing ? 'animate-slide-down' : 'animate-slide-up'}`}>
            <button 
              onClick = {closeAttachMenu}
              className="flex justify-center w-full pt-3 pb-2">
              <div 
                className="w-6 h-6 bg-gray-400"
                style={{ maskImage: 'url(/icons/keyboard-arrow-down.svg)', WebkitMaskImage: 'url(/icons/keyboard-arrow-down.svg)', maskSize: 'contain', WebkitMaskSize: 'contain' }}
              />
            </button>

            <div className="px-6 pb-4">
              <p className="text-[12px] text-[#959595] font-medium mb-3">자주 묻는 질문 Top</p>
              <div className="flex flex-col gap-3">
                {faqs.map((faq, i) => (
                  <button
                    key={i}
                    className="text-left text-[15px] font-bold text-black"
                    onClick={() => {
                      closeAttachMenu();     // 메뉴 닫기
                      handleSend(faq);       // 클릭시 질문 전송
                    }}
                  >
                    {faq}
                  </button>
                ))}
              </div>
            </div>

            <Navbar relative={true} />
          </div>
        </>
      )}
    </main>
  );
}