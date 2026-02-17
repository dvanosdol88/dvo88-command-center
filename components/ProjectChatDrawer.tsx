import React, { useEffect, useRef, useState } from "react";
import { Bot, MessageSquare, Send, User, X } from "lucide-react";
import { getProjectChatResponse, type ProjectChatMessage } from "../services/projectChatService";

const INITIAL_MESSAGE: ProjectChatMessage = {
  role: "assistant",
  text: "Hello! I'm your project assistant. I know the current status of all 7 projects in your portfolio. Ask me anything - what to work on next, project status summaries, or cross-project insights.",
};

const ProjectChatDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ProjectChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const responseText = await getProjectChatResponse(messages, userMessage);
      setMessages((prev) => [...prev, { role: "assistant", text: responseText }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, I hit an error while reaching the project AI service." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen
            ? "bg-slate-700 text-slate-300 rotate-90"
            : "bg-emerald-700 hover:bg-emerald-600 text-white hover:scale-110 shadow-emerald-950/40"
        }`}
        aria-label={isOpen ? "Close project assistant" : "Open project assistant"}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      <div
        className={`fixed bottom-24 right-6 w-80 md:w-96 z-50 flex flex-col bg-slate-900 border border-slate-700 rounded-xl shadow-2xl transition-all duration-300 origin-bottom-right ${
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-10 pointer-events-none"
        }`}
        style={{ height: "500px", maxHeight: "calc(100vh - 120px)" }}
      >
        <div className="p-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur rounded-t-xl flex items-center gap-2">
          <MessageSquare className="text-emerald-400 w-5 h-5" />
          <div>
            <h3 className="text-sm font-bold text-white">Project Assistant</h3>
            <div className="text-[10px] text-slate-400">Knows all 7 projects</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  message.role === "user"
                    ? "bg-slate-700 text-slate-300"
                    : "bg-emerald-900/50 text-emerald-300"
                }`}
              >
                {message.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div
                className={`text-sm p-3 rounded-2xl max-w-[80%] ${
                  message.role === "user"
                    ? "bg-emerald-900/50 text-white rounded-tr-sm"
                    : "bg-emerald-900/20 text-slate-200 border border-emerald-500/20 rounded-tl-sm"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-900/50 text-emerald-300 flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-2xl rounded-tl-sm border border-emerald-500/20">
                <div className="flex gap-1 h-5 items-center">
                  <div
                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-900 rounded-b-xl">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about your projects..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400 disabled:opacity-50 disabled:hover:text-emerald-500 p-1"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProjectChatDrawer;
