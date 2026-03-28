import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Image as ImageIcon, 
  Send, 
  Code, 
  User, 
  Bot, 
  Trash2,
  Menu,
  X,
  XCircle,
  RotateCcw
} from 'lucide-react';

// API Key (실행 환경에서 자동 주입됨)
const apiKey = "";

const SKILL_LIST = [
  "변수 (Variable) 만들기",
  "참/거짓 (True/False) 활용",
  "비교 연산자 (==, !=, >= 등)",
  "조건문 (if/else)",
  "for 반복문",
  "while 반복문",
  "리스트/배열 (List/Array)",
  "in 연산자",
  "문자열 포매팅 (f-string, format 등)",
  "함수 (Function) 만들기",
  "클래스 (Class) / 객체지향"
];

export default function App() {
  const [chats, setChats] = useState([
    {
      id: Date.now().toString(),
      title: '새로운 질문',
      messages: [
        {
          id: 'welcome-msg',
          role: 'model',
          text: '안녕! 나는 너의 친절한 코딩 선생님이야. 🧑‍🏫\n\n코딩하다가 막히는 부분이 있거나 궁금한 게 있으면 언제든 물어봐! 화면 캡처나 에러 메시지 사진을 올려주면 같이 보면서 설명해 줄게. 정답을 바로 알려주기보다는 네가 스스로 풀 수 있게 힌트를 줄 테니까, 우리 같이 재밌게 배워보자!'
        }
      ]
    }
  ]);
  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageMime, setSelectedImageMime] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [isAssessmentDone, setIsAssessmentDone] = useState(false);
  const [userSkills, setUserSkills] = useState([]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // 완전 초기화 (재시작) 함수
  const handleFullReset = () => {
    if (window.confirm("정말 처음부터 다시 시작할까요? 모든 대화 내용과 체크리스트가 초기화됩니다.")) {
      setIsAssessmentDone(false);
      setUserSkills([]);
      const initialChatId = Date.now().toString();
      setChats([
        {
          id: initialChatId,
          title: '새로운 질문',
          messages: [
            {
              id: 'welcome-msg',
              role: 'model',
              text: '안녕! 나는 너의 친절한 코딩 선생님이야. 🧑‍🏫\n\n코딩하다가 막히는 부분이 있거나 궁금한 게 있으면 언제든 물어봐! 화면 캡처나 에러 메시지 사진을 올려주면 같이 보면서 설명해 줄게. 정답을 바로 알려주기보다는 네가 스스로 풀 수 있게 힌트를 줄 테니까, 우리 같이 재밌게 배워보자!'
            }
          ]
        }
      ]);
      setActiveChatId(initialChatId);
      setInputText('');
      setSelectedImage(null);
      setSelectedImageMime(null);
    }
  };

  const handleSkillToggle = (skill) => {
    setUserSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const startChat = () => {
    setIsAssessmentDone(true);
    // 환영 메시지 업데이트
    const skillText = userSkills.length > 0 ? userSkills.join(', ') + ' 등을 알고 있구나!' : '아직 코딩을 처음 접해보는구나!';
    const welcomeMsg = `안녕! 나는 너의 친절한 코딩 선생님이야. 🧑‍🏫\n\n사전 체크를 해보니 ${skillText} 앞으로 네가 아는 지식을 바탕으로 아주 쉽게 설명해줄게.\n\n코딩하다가 막히는 부분이 있거나 궁금한 게 있으면 언제든 물어봐!`;
    
    const newChats = [...chats];
    newChats[0].messages[0].text = welcomeMsg;
    setChats(newChats);
  };

  // 현재 활성화된 채팅 가져오기
  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  // 메시지 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat.messages, isTyping]);

  // 새 채팅 만들기
  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: '새로운 질문',
      messages: [
        {
          id: Date.now().toString() + '-init',
          role: 'model',
          text: '새로운 주제로 이야기해 볼까? 어떤 게 궁금해?'
        }
      ]
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  // 채팅 삭제
  const deleteChat = (e, id) => {
    e.stopPropagation();
    const filteredChats = chats.filter(c => c.id !== id);
    if (filteredChats.length === 0) {
      createNewChat();
    } else {
      setChats(filteredChats);
      if (activeChatId === id) setActiveChatId(filteredChats[0].id);
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const mimeType = file.type;
    setSelectedImageMime(mimeType);

    const reader = new FileReader();
    reader.onloadend = () => {
      // base64 데이터만 추출
      const base64String = reader.result.split(',')[1];
      setSelectedImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  // 메시지 전송 로직
  const sendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const newUserMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      image: selectedImage,
      mimeType: selectedImageMime
    };

    // UI 즉각 업데이트
    const updatedChats = chats.map(chat => {
      if (chat.id === activeChatId) {
        // 첫 질문이면 채팅방 제목 업데이트
        const newTitle = chat.messages.length === 1 && inputText ? inputText.slice(0, 15) + '...' : chat.title;
        return { ...chat, title: newTitle, messages: [...chat.messages, newUserMessage] };
      }
      return chat;
    });

    setChats(updatedChats);
    setInputText('');
    setSelectedImage(null);
    setSelectedImageMime(null);
    setIsTyping(true);

    try {
      const currentChatHistory = updatedChats.find(c => c.id === activeChatId).messages;
      const apiResponse = await callGeminiAPI(currentChatHistory);
      
      const newModelMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: apiResponse
      };

      setChats(prev => prev.map(chat => 
        chat.id === activeChatId 
          ? { ...chat, messages: [...chat.messages, newModelMessage] } 
          : chat
      ));
    } catch (error) {
      const errorMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: '앗, 선생님이 잠깐 딴생각을 했나 봐. 통신에 문제가 생겼어! 다시 한 번 말해줄래? 😅'
      };
      setChats(prev => prev.map(chat => 
        chat.id === activeChatId 
          ? { ...chat, messages: [...chat.messages, errorMessage] } 
          : chat
      ));
    } finally {
      setIsTyping(false);
    }
  };

  // Gemini API 호출 함수 (지수 백오프 적용 및 시스템 프롬프트 설정)
  const callGeminiAPI = async (messages) => {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const knownSkills = userSkills.length > 0 ? userSkills.join(', ') : '아는 코딩 문법이 거의 없음';

    // 시스템 지시사항 (선생님 페르소나, 핵심 요구사항 반영)
    const systemInstruction = `당신은 코딩을 처음 배우는 초보자를 위한 아주 친절하고 인내심 많은 코딩 선생님입니다.
현재 학생이 알고 있는 코딩 지식은 다음과 같습니다: [${knownSkills}]

다음 규칙을 무조건 지켜주세요:
1. 어려운 전문 용어는 절대 피하고, 일상생활의 비유(예: 요리 레시피, 서랍장, 우편함 등)를 들어 초보자가 이해하기 아주 쉽게 설명하세요.
2. 코딩 문제나 에러에 대해 물어보면 **절대 정답이나 완성된 코드를 먼저 알려주지 마세요.**
3. 대신, 문제의 원인이 무엇인지 스스로 생각해보게 하는 질문을 던지거나 아주 작은 힌트를 단계별로 주세요.
4. 사용자가 힌트를 보고 시도하도록 계속 격려하세요. 사용자가 여러 번 시도해도 도저히 모르겠다고 명시적으로 "포기"하거나 "정답을 알려줘"라고 간곡히 부탁할 때만 정답 코드와 친절한 해설을 제공하세요.
5. 코딩, 프로그래밍, 컴퓨터 과학, IT와 관련 없는 질문(예: 역사, 수학, 날씨, 연예인 등)을 받으면 "미안해! 나는 코딩 선생님이라 그 부분은 잘 모르겠어. 코딩이나 컴퓨터에 대해 물어보면 정말 쉽게 알려줄게!"라고 정중하게 거절하세요.
6. 항상 친구나 다정한 선생님처럼 친근한 말투를 사용하세요. (예: "~했어?", "~해볼까?", "정말 잘했어!")
7. **[아주 중요]** 답변이나 힌트를 줄 때는 반드시 **학생이 알고 있는 지식([${knownSkills}]) 내에서만** 해결 가능한 코드를 먼저 제시하세요. 코드가 다소 길어지거나 비효율적이더라도 학생이 아는 문법만 사용해야 합니다.
8. **[아주 중요]** 학생이 아는 선에서 설명을 마친 후, 만약 더 효율적인 문법이나 개념(학생이 모르는 새로운 개념)이 있다면 마지막에 반드시 다음과 같은 형식으로 질문하세요: 
"이 코드도 맞지만, (사용자가 모르는 효율적인 개념)을 활용하는게 더 효율적일 거에요! 혹시 (사용자가 모르는 개념)에 대해서 설명해드릴까요?"`;

    // 메시지 포맷팅 (초기 인사말 제외)
    const formattedHistory = messages.filter(m => m.id !== 'welcome-msg' && !m.id.endsWith('-init')).map(m => {
      const parts = [];
      if (m.text) parts.push({ text: m.text });
      if (m.image) {
        parts.push({
          inlineData: {
            mimeType: m.mimeType || 'image/jpeg',
            data: m.image
          }
        });
      }
      return {
        role: m.role,
        parts: parts
      };
    });

    const payload = {
      contents: formattedHistory,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      }
    };

    // 재시도 로직 (지수 백오프)
    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < 6; i++) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "대답을 생성하지 못했어요.";
      } catch (error) {
        if (i === 5) throw error; // 마지막 시도 실패시 에러 던짐
        await new Promise(resolve => setTimeout(resolve, delays[i]));
      }
    }
  };

  // 간단한 마크다운/코드 블록 렌더러
  const renderMessageText = (text) => {
    if (!text) return null;
    
    // 코드 블록 분리 (```코드```)
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeContent = part.replace(/```[a-z]*\n?/i, '').replace(/```$/, '');
        return (
          <div key={index} className="my-3 bg-gray-800 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-900 px-4 py-1.5 flex items-center text-xs text-gray-400">
              <Code size={14} className="mr-2" /> Code
            </div>
            <pre className="p-4 text-sm text-green-400 overflow-x-auto whitespace-pre-wrap font-mono">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }
      // 일반 텍스트 내 굵은 글씨 및 줄바꿈 처리
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part.split(/(\*\*.*?\*\*)/g).map((subPart, subIndex) => {
            if (subPart.startsWith('**') && subPart.endsWith('**')) {
              return <strong key={subIndex} className="font-bold text-indigo-700">{subPart.slice(2, -2)}</strong>;
            }
            return subPart;
          })}
        </span>
      );
    });
  };

  return (
    <>
      {!isAssessmentDone ? (
        <div className="flex h-screen items-center justify-center bg-slate-50 p-4 font-sans text-slate-800">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
            <div className="flex justify-center mb-6 text-indigo-600">
              <Bot size={56} className="bg-indigo-50 p-3 rounded-full" />
            </div>
            <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">반가워! 코딩 선생님이야 🧑‍🏫</h1>
            <p className="text-slate-500 text-center mb-6 text-sm">
              너에게 딱 맞는 맞춤 설명을 위해,<br/>지금 알고 있는 코딩 지식을 체크해줄래?
            </p>
            
            <div className="space-y-2 mb-8 max-h-60 overflow-y-auto pr-2 scroll-smooth">
              {SKILL_LIST.map(skill => (
                <label key={skill} className="flex items-center p-3.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    checked={userSkills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                  />
                  <span className="ml-3 text-slate-700 font-medium">{skill}</span>
                </label>
              ))}
            </div>

            <button 
              onClick={startChat}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md text-lg"
            >
              선택 완료! 대화 시작하기
            </button>
          </div>
        </div>
      ) : (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
          
          {/* 모바일 오버레이 */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/20 z-20 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* 사이드바 */}
          <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-30 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out shadow-xl md:shadow-none`}>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-lg text-indigo-600">
                <Bot size={24} />
                코딩 멘토 AI
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1 md:hidden text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <button 
                onClick={createNewChat}
                className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors border border-indigo-100"
              >
                <Plus size={18} />
                새 질문하기
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4 text-sm">
              {chats.map(chat => (
                <div 
                  key={chat.id}
                  onClick={() => {
                    setActiveChatId(chat.id);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    activeChatId === chat.id 
                      ? 'bg-indigo-500 text-white shadow-sm' 
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare size={16} className={activeChatId === chat.id ? 'text-indigo-200' : 'text-slate-400'} />
                    <span className="truncate">{chat.title}</span>
                  </div>
                  <button 
                    onClick={(e) => deleteChat(e, chat.id)}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity ${
                      activeChatId === chat.id ? 'hover:bg-indigo-600 text-indigo-200' : 'hover:bg-slate-200 text-slate-400'
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            {/* 하단 완전 초기화 버튼 */}
            <div className="p-4 border-t border-slate-100">
              <button 
                onClick={handleFullReset}
                className="w-full py-2.5 px-4 text-slate-500 hover:bg-red-50 hover:text-red-600 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw size={16} />
                처음부터 다시 시작
              </button>
            </div>
          </div>

          {/* 메인 채팅 영역 */}
          <div className="flex-1 flex flex-col h-full bg-slate-50/50 relative">
            {/* 헤더 */}
            <header className="h-16 flex items-center px-4 bg-white border-b border-slate-200 shadow-sm z-10 sticky top-0">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 mr-3 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden"
              >
                <Menu size={20} />
              </button>
              <h2 className="font-semibold text-slate-700 truncate">{activeChat.title}</h2>
            </header>

            {/* 메시지 리스트 */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
              {activeChat.messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* 아바타 */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                    msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                  }`}>
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>

                  {/* 말풍선 */}
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                    <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                    }`}>
                      {msg.image && (
                        <img 
                          src={`data:${msg.mimeType || 'image/jpeg'};base64,${msg.image}`} 
                          alt="Uploaded code" 
                          className="max-w-full md:max-w-sm rounded-lg mb-3 border border-slate-200/20"
                        />
                      )}
                      <div className={msg.role === 'user' ? 'text-indigo-50' : 'text-slate-700'}>
                        {renderMessageText(msg.text)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 타이핑 인디케이터 */}
              {isTyping && (
                <div className="flex gap-4 max-w-3xl mx-auto flex-row">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-sm">
                    <Bot size={20} />
                  </div>
                  <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 입력창 영역 */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="max-w-3xl mx-auto">
                {/* 첨부된 이미지 미리보기 */}
                {selectedImage && (
                  <div className="mb-3 relative inline-block">
                    <img 
                      src={`data:${selectedImageMime};base64,${selectedImage}`} 
                      alt="Preview" 
                      className="h-20 w-auto rounded-lg border border-slate-200 shadow-sm object-cover"
                    />
                    <button 
                      onClick={() => { setSelectedImage(null); setSelectedImageMime(null); }}
                      className="absolute -top-2 -right-2 bg-white text-slate-500 hover:text-red-500 rounded-full shadow-md transition-colors"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                  {/* 숨겨진 파일 인풋 */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shrink-0"
                    title="사진 첨부하기"
                  >
                    <ImageIcon size={22} />
                  </button>

                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="코딩에 대해 무엇이든 물어보세요! (엔터로 전송, Shift+엔터로 줄바꿈)"
                    className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-slate-700 placeholder-slate-400"
                    rows={1}
                    style={{ height: 'auto' }}
                  />

                  <button 
                    onClick={sendMessage}
                    disabled={(!inputText.trim() && !selectedImage) || isTyping}
                    className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shrink-0 shadow-sm"
                  >
                    <Send size={20} className={inputText.trim() || selectedImage ? "translate-x-0.5 -translate-y-0.5" : ""} />
                  </button>
                </div>
                <div className="text-center mt-2 text-xs text-slate-400">
                  선생님은 정답을 바로 주지 않고, 스스로 생각할 수 있게 힌트를 준답니다!
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}