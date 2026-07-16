import { useState } from "react";

import { Bot, Send, User, Sparkles } from "lucide-react";

export default function AIAssistant() {
  const [message, setMessage] = useState("");

  const [chat, setChat] = useState([
    {
      sender: "ai",
      text: "👋 Hello! I'm your PricePilot AI Assistant. Ask me anything about pricing, competitors, or sales.",
    },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    const userMessage = {
      sender: "user",
      text: message,
    };

    let aiReply = "";

    const text = message.toLowerCase();

    if (text.includes("iphone")) {
      aiReply =
        "📱 AI Suggestion: Reduce the iPhone 16 Pro price by $20 to stay competitive.";
    } else if (text.includes("sales")) {
      aiReply =
        "📈 Sales are expected to increase by 18% next month.";
    } else if (text.includes("competitor")) {
      aiReply =
        "🌍 Amazon currently has the lowest competitor price.";
    } else if (text.includes("forecast")) {
      aiReply =
        "📊 Demand forecast predicts strong growth during weekends.";
    } else {
      aiReply =
        "🤖 I understand your question. Once connected to the backend, I'll provide real-time AI recommendations.";
    }

    setChat((prev) => [
      ...prev,
      userMessage,
      {
        sender: "ai",
        text: aiReply,
      },
    ]);

    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50">

     
          <div className="flex justify-between items-center mb-8">

            <div>

              <h1 className="text-4xl font-bold">
                AI Assistant
              </h1>

              <p className="text-gray-500 mt-2">
                Chat with PricePilot AI
              </p>

            </div>

            <div className="bg-blue-600 text-white px-5 py-3 rounded-xl flex items-center gap-2">
              <Sparkles size={20} />
              AI Powered
            </div>

          </div>

          <div className="bg-white rounded-3xl shadow border h-[650px] flex flex-col">

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {chat.map((item, index) => (

                <div
                  key={index}
                  className={`flex ${
                    item.sender === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-lg rounded-2xl px-5 py-4 flex gap-3 ${
                      item.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100"
                    }`}
                  >

                    {item.sender === "user" ? (
                      <User size={20} />
                    ) : (
                      <Bot size={20} />
                    )}

                    <p>{item.text}</p>

                  </div>

                </div>

              ))}

            </div>

            <div className="border-t p-5 flex gap-4">

              <input
                type="text"
                placeholder="Ask PricePilot AI..."
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend();
                  }
                }}
                className="flex-1 border rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={handleSend}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl"
              >
                <Send />
              </button>

            </div>

          </div>

       

    </div>
  );
}