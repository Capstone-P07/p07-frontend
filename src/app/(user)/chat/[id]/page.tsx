"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";

interface Message {
  role: "user" | "assistant";
  content: string;
  logId?: number;
}

interface FeedbackState {
  rating: 'thumb_up' | 'thumb_down' | null;
  comment: string;
  showComment: boolean;
  submitted: boolean;
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [notificationSound, setNotificationSound] = useState(true);
  const [feedbacks, setFeedbacks] = useState<Record<number, FeedbackState>>({});
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionInitialized = useRef(false);

  useEffect(() => {
    if (sessionInitialized.current) return;
    sessionInitialized.current = true;

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
  }, []);

  const fetchLogs = async (sid: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await api.get(`/logs/chat?sessionId=${sid}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const logs = res.data.data?.logs ?? [];
      setMessages(logs.map((log: any) => ({
        role: log.role,
        content: log.content,
        logId: log.logId,
      })));
    } catch {}
  };

  useEffect(() => {
    if (!sessionId) return;
    fetchLogs(sessionId);
  }, [sessionId]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserEmail(res.data.data.email);
      } catch {}
    };
    fetchMe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const userMessage = (text || message).trim();
    if (!userMessage || !sessionId || isStreaming) return;

    setMessage("");
    messageInputRef.current?.focus();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsStreaming(true);

    try {
      const token = localStorage.getItem("accessToken");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/message/${sessionId}`, {
        method: "POST",
        headers,
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
              const text = parsed.text || parsed.content || "";
              if (text) {
                assistantMessage += text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: assistantMessage };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "오류가 발생했습니다. 다시 시도해주세요." }]);
    } finally {
      setIsStreaming(false);
      messageInputRef.current?.focus();
      if (sessionId) await fetchLogs(sessionId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleSend();
    }
  };

  const handleFeedback = (logId: number, rating: 'thumb_up' | 'thumb_down') => {
    setFeedbacks((prev) => ({
      ...prev,
      [logId]: {
        rating,
        comment: prev[logId]?.comment || "",
        showComment: rating === 'thumb_down',
        submitted: false,
      },
    }));
  };

  const handleFeedbackSubmit = async (logId: number) => {
    const fb = feedbacks[logId];
    if (!fb) return;
    try {
      await api.post("/logs/feedback", {
        logId,
        rating: fb.rating,
        comment: fb.comment || undefined,
      });
      setFeedbacks((prev) => ({
        ...prev,
        [logId]: { ...prev[logId], submitted: true, showComment: false },
      }));
    } catch {}
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
        <button onClick={() => setShowProfileModal(true)} className="w-10 h-10 flex items-center justify-center mr-1">
          <div className="w-8 h-8 bg-[#959595]" style={{ maskImage: 'url(/icons/icon-profile.svg)', WebkitMaskImage: 'url(/icons/icon-profile.svg)', maskSize: 'contain', WebkitMaskSize: 'contain' }} />
        </button>
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
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            {msg.role === "user" ? (
              <div className="bg-[#5745ff] text-white px-6 py-3.5 rounded-[22px] text-[14px] font-bold shadow-md max-w-[280px]">
                {msg.content}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="bg-white rounded-tr-[30px] rounded-br-[30px] rounded-bl-[30px] p-6 shadow-sm max-w-[310px]">
                  <p className="text-[14px] leading-relaxed text-[#3a3a3a] font-medium">
                    {msg.content}
                    {isStreaming && i === messages.length - 1 && (
                      <span className="inline-block w-1 h-4 bg-gray-400 animate-pulse ml-1" />
                    )}
                  </p>
                </div>

                {msg.logId && !(isStreaming && i === messages.length - 1) && (
                  <div className="flex flex-col gap-2 pl-2">
                    {feedbacks[msg.logId]?.submitted ? (
                      <p className="text-[12px] text-[#959595]">피드백 감사합니다 😊</p>
                    ) : (
                      <>
                        <div className="flex gap-3 items-center">
                          <button
                            onClick={() => handleFeedback(msg.logId!, 'thumb_up')}
                            className="w-5 h-5 flex items-center justify-center"
                          >
                            <div
                              className="w-5 h-5"
                              style={{
                                maskImage: 'url(/icons/icon-thumb-up.svg)',
                                WebkitMaskImage: 'url(/icons/icon-thumb-up.svg)',
                                maskSize: 'contain',
                                WebkitMaskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                                backgroundColor: feedbacks[msg.logId!]?.rating === 'thumb_up' ? '#5745ff' : '#c0c0c0',
                              }}
                            />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.logId!, 'thumb_down')}
                            className="w-5 h-5 flex items-center justify-center"
                          >
                            <div
                              className="w-5 h-5"
                              style={{
                                maskImage: 'url(/icons/icon-thumb-down.svg)',
                                WebkitMaskImage: 'url(/icons/icon-thumb-down.svg)',
                                maskSize: 'contain',
                                WebkitMaskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                                backgroundColor: feedbacks[msg.logId!]?.rating === 'thumb_down' ? '#5745ff' : '#c0c0c0',
                              }}
                            />
                          </button>
                          {feedbacks[msg.logId!]?.rating && !feedbacks[msg.logId!]?.showComment && (
                            <button
                              onClick={() => handleFeedbackSubmit(msg.logId!)}
                              className="text-[12px] text-[#5745ff] font-bold"
                            >
                              제출
                            </button>
                          )}
                        </div>
                        {feedbacks[msg.logId!]?.showComment && (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={feedbacks[msg.logId!]?.comment || ""}
                              onChange={(e) => setFeedbacks((prev) => ({
                                ...prev,
                                [msg.logId!]: { ...prev[msg.logId!], comment: e.target.value },
                              }))}
                              placeholder="어떤 점이 불만족스러우셨나요? (선택)"
                              className="w-[260px] h-[36px] px-3 bg-white rounded-full text-[12px] outline-none border border-[#e0e0e0]"
                            />
                            <button
                              onClick={() => handleFeedbackSubmit(msg.logId!)}
                              className="text-[12px] text-[#5745ff] font-bold text-left pl-2"
                            >
                              제출
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
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
            onKeyDown={handleKeyDown}
            placeholder="메세지를 입력하세요."
            className="w-full bg-transparent text-[14px] font-medium outline-none placeholder-[#979292]"
          />
        </div>
        <button onClick={() => handleSend()} className="w-6 h-6 flex items-center justify-center mr-[13px]">
          <div className="w-6 h-6 bg-[#5745ff]" style={{ maskImage: 'url(/icons/icon-send.svg)', WebkitMaskImage: 'url(/icons/icon-send.svg)', maskSize: 'contain', WebkitMaskSize: 'contain' }} />
        </button>
      </footer>

      {showAttachMenu && (
        <div className={`absolute bottom-[63px] left-0 right-0 z-40 bg-white rounded-t-[20px] ${isClosing ? 'animate-slide-down' : 'animate-slide-up'}`}>
          <button onClick={closeAttachMenu} className="flex justify-center w-full pt-3 pb-2">
            <div className="w-6 h-6 bg-gray-400" style={{ maskImage: 'url(/icons/keyboard-arrow-down.svg)', WebkitMaskImage: 'url(/icons/keyboard-arrow-down.svg)', maskSize: 'contain', WebkitMaskSize: 'contain' }} />
          </button>
          <div className="px-6 pb-4">
            <p className="text-[12px] text-[#959595] font-medium mb-3">자주 묻는 질문 Top</p>
            <div className="flex flex-col gap-3">
            </div>
          </div>
          <Navbar relative={true} />
        </div>
      )}

      {showProfileModal && (
        <div className="absolute inset-0 bg-black/20 z-[60] flex items-end justify-center" onClick={() => setShowProfileModal(false)}>
          <div className="w-full bg-white rounded-t-[30px] p-8 animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[16px] font-bold text-black">내 정보</span>
              <button onClick={() => setShowProfileModal(false)} className="text-[20px] text-gray-400">×</button>
            </div>
            <p className="text-[14px] text-[#959595] font-medium mb-5">{userEmail}</p>
            <div className="h-px bg-black/5 w-full mb-5" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-[#646665]" style={{ maskImage: 'url(/icons/icon-bell.svg)', WebkitMaskImage: 'url(/icons/icon-bell.svg)', maskSize: 'contain', WebkitMaskSize: 'contain' }} />
                <span className="text-[#646665] text-[13px] font-bold">채팅 알림음</span>
              </div>
              <button
                onClick={() => setNotificationSound((prev) => !prev)}
                className={`relative w-[38px] h-6 flex items-center rounded-full transition-colors duration-200 focus:outline-none shadow-inner ${notificationSound ? "bg-[#00a847]" : "bg-[#eaeaea]"}`}
              >
                <div className={`w-[18px] h-[18px] bg-white rounded-full shadow transform transition-transform duration-200 ${notificationSound ? "translate-x-[17px]" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}