import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Play, Square, Loader2, Sparkles, AlertCircle, Radio, Send, MessageCircle, Users, UserX, VolumeX, Settings, X, Monitor, MonitorOff, Ban, Volume2 } from 'lucide-react';
import { User, Spectator } from '../types';
import Peer from 'peerjs';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

interface LiveLabProps {
  user: User | null;
  onRequireAuth: () => void;
  setLiveStatus?: (status: boolean) => void;
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  isTeacher: boolean;
}

const MOCK_COMMENTS: ChatMessage[] = [];
const ROOM_ID = "bac-physique-live-room";

const PEER_CONFIG = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  }
};

const LiveLab: React.FC<LiveLabProps> = ({ user, onRequireAuth, setLiveStatus }) => {
  if (!user) {
    onRequireAuth();
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
         <div className="text-center">
             <Radio className="w-16 h-16 text-brand-300 mx-auto mb-4" />
             <h2 className="text-2xl font-bold text-brand-900 mb-2">Accès Restreint</h2>
             <p className="text-brand-500">Veuillez vous connecter pour accéder au Laboratoire Live.</p>
         </div>
      </div>
    );
  }

  return user.role === 'TEACHER' 
    ? <TeacherLiveLab setLiveStatus={setLiveStatus} user={user} /> 
    : <StudentLiveLab user={user} />;
};

/* --- SHARED CHAT PANEL --- */
interface ChatPanelProps {
    messages: ChatMessage[];
    onSend: (text: string) => void;
    currentUserName: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSend, currentUserName }) => {
    const [text, setText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSend(text);
            setText('');
        }
    };

    return (
        <div className="w-full lg:w-80 bg-white border border-brand-200 rounded-3xl flex flex-col overflow-hidden h-[500px] lg:h-auto shadow-lg flex-shrink-0">
            <div className="p-4 border-b border-brand-100 bg-brand-50 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-bac-blue" />
                <h3 className="font-bold text-brand-900">Chat du Cours</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10 text-sm">
                        Aucun message pour le moment.
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.user === currentUserName;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className={`text-xs font-bold ${msg.isTeacher ? 'text-bac-blue' : 'text-brand-500'}`}>
                                        {msg.user} {isMe && '(Vous)'}
                                    </span>
                                    <span className="text-[10px] text-brand-400">{msg.time}</span>
                                </div>
                                <div className={`px-4 py-2 rounded-2xl text-sm max-w-[90%] break-words ${
                                    isMe 
                                        ? 'bg-bac-blue text-white rounded-tr-sm' 
                                        : 'bg-brand-100 text-brand-800 rounded-tl-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-brand-100 bg-brand-50">
                <div className="relative">
                    <input 
                        type="text" 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Envoyer un message..."
                        className="w-full bg-white border border-brand-200 rounded-xl py-2.5 pl-3 pr-10 text-brand-900 focus:outline-none focus:border-bac-blue text-sm shadow-sm"
                    />
                    <button 
                        type="submit" 
                        disabled={!text.trim()}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-bac-blue hover:bg-sky-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};

/* --- SPECTATOR LIST --- */
const SpectatorList: React.FC<{ spectators: Spectator[], onKick: (id: string) => void, onMute: (id: string) => void }> = ({ spectators, onKick, onMute }) => {
    return (
        <div className="w-full lg:w-64 bg-white border border-brand-200 rounded-3xl flex flex-col overflow-hidden h-[300px] lg:h-auto shadow-lg flex-shrink-0">
             <div className="p-4 border-b border-brand-100 bg-brand-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-bac-blue" />
                    <h3 className="font-bold text-brand-900">Spectateurs</h3>
                </div>
                <span className="bg-bac-blue text-white text-xs px-2 py-0.5 rounded-full font-bold">{spectators.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {spectators.length === 0 ? (
                    <div className="text-center text-gray-400 mt-4 text-xs p-4">
                        Aucun spectateur connecté.
                    </div>
                ) : (
                    spectators.map(s => (
                        <div key={s.id} className="flex items-center justify-between p-2 hover:bg-brand-50 rounded-lg group transition-colors">
                             <div className="flex items-center gap-2 overflow-hidden">
                                 <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center text-xs font-bold text-brand-600">
                                     {s.name.charAt(0)}
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="text-sm font-medium text-brand-700 truncate w-24">{s.name}</span>
                                     {s.isMuted && <span className="text-[10px] text-red-500 font-bold">Muet</span>}
                                 </div>
                             </div>
                             
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => onMute(s.id)} 
                                    className={`p-1.5 rounded-lg hover:bg-gray-200 ${s.isMuted ? 'text-red-500' : 'text-gray-400'}`}
                                    title={s.isMuted ? "Rétablir" : "Rendre muet"}
                                >
                                    {s.isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                </button>
                                <button 
                                    onClick={() => onKick(s.id)} 
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    title="Exclure"
                                >
                                    <Ban className="w-3 h-3" />
                                </button>
                             </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

/* --- STUDENT VIEW --- */
const StudentLiveLab: React.FC<{ user: User }> = ({ user }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_COMMENTS);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const peerRef = useRef<Peer | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
        if (peerRef.current) peerRef.current.destroy();
        if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const handleJoinStream = () => {
      setIsPlaying(true);
      setIsConnecting(true);
      setError(null);

      try {
          socketRef.current = io('/', { withCredentials: true });
          const peer = new Peer(undefined, PEER_CONFIG);
          peerRef.current = peer;

          // Listen for Kick event
          socketRef.current.on('force-disconnect', () => {
              alert("Vous avez été exclu du cours.");
              navigate('/'); // Redirect to home
          });

          socketRef.current.on('error-message', (msg: string) => {
              alert(msg);
          });

          peer.on('open', (peerId) => {
              socketRef.current?.emit('join-room', ROOM_ID, { 
                  peerId, 
                  name: user.name, 
                  role: 'STUDENT'
              });
          });

          peer.on('call', (call) => {
              call.answer(); 
              call.on('stream', (remoteStream) => {
                  setIsConnecting(false);
                  if (videoRef.current) {
                      videoRef.current.srcObject = remoteStream;
                      videoRef.current.play().catch(console.error);
                  }
              });
          });

          socketRef.current.on('receive-message', (msg: ChatMessage) => {
             setMessages(prev => [...prev, msg]);
          });

          peer.on('error', (err) => {
              console.error(err);
              setError("Erreur de connexion P2P.");
              setIsConnecting(false);
          });

      } catch (e) {
          console.error(e);
          setError("Impossible de rejoindre le serveur.");
          setIsConnecting(false);
      }
  };

  const handleSend = (text: string) => {
    const newMsg: ChatMessage = {
        id: Date.now().toString(),
        user: user.name,
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTeacher: false
    };
    setMessages([...messages, newMsg]);
    socketRef.current?.emit('send-message', newMsg);
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-6">
       <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-brand-900 flex items-center gap-2">
                    <Radio className="text-red-600 animate-pulse" />
                    Salle de Classe Virtuelle
                </h1>
                <p className="text-brand-500 text-sm">Mode Spectateur</p>
            </div>
            <div className="px-3 py-1 bg-white border border-brand-200 rounded-full flex items-center gap-2 shadow-sm">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <span className="text-brand-500 text-xs font-bold">En ligne</span>
            </div>
       </div>

       <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
           <div className="flex-1 bg-black rounded-3xl overflow-hidden relative border border-brand-200 shadow-2xl flex items-center justify-center">
              {isPlaying ? (
                 <div className="w-full h-full relative bg-black flex items-center justify-center">
                    <video 
                        ref={videoRef} 
                        className="w-full h-full object-contain" 
                        autoPlay 
                        playsInline 
                    />
                    {isConnecting && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-20">
                            <Loader2 className="w-12 h-12 text-bac-blue animate-spin mb-4" />
                            <p className="text-white text-lg font-medium tracking-wide">Attente du signal du professeur...</p>
                        </div>
                    )}
                 </div>
              ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-50/90 backdrop-blur-sm z-10 text-center p-6">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-bac-blue/10 border border-brand-200 relative">
                        <Radio className="w-8 h-8 text-brand-400" />
                        <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-brand-900 mb-2">Rejoindre le cours en direct</h2>
                    <p className="text-brand-500 max-w-md mb-8">
                        Vous entrerez en tant que spectateur. Vous pourrez voir le tableau et interagir via le chat.
                    </p>
                    {error && (
                         <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold flex items-center gap-2">
                             <AlertCircle className="w-4 h-4" />
                             {error}
                         </div>
                    )}
                    <button 
                        onClick={handleJoinStream}
                        className="group px-8 py-3.5 bg-bac-blue hover:bg-sky-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-bac-blue/30 flex items-center gap-3"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        Rejoindre la session
                    </button>
                </div>
              )}
           </div>

           <ChatPanel messages={messages} onSend={handleSend} currentUserName={user.name} />
       </div>
    </div>
  );
};

/* --- TEACHER VIEW --- */
const TeacherLiveLab: React.FC<{setLiveStatus?: (status: boolean) => void, user: User}> = ({setLiveStatus, user}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_COMMENTS);
  const [isConnecting, setIsConnecting] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(false); 
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spectators, setSpectators] = useState<Spectator[]>([]);

  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const streamRef = useRef<MediaStream | null>(null); 
  const cameraStreamRef = useRef<MediaStream | null>(null); 
  const intervalRef = useRef<number | null>(null);

  const peerRef = useRef<Peer | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const isStreamingRef = useRef(false);

  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  useEffect(() => {
    return () => {
        stopSession(true); 
    };
  }, []);

  const handleSend = (text: string) => {
    const newMsg: ChatMessage = {
        id: Date.now().toString(),
        user: user.name, 
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTeacher: true
    };
    setMessages([...messages, newMsg]);
    socketRef.current?.emit('send-message', newMsg);
  };

  const startSession = async () => {
    setError(null);
    setIsConnecting(true);
    
    if (!cameraOn) {
        await toggleCamera();
        await new Promise(r => setTimeout(r, 500));
    }

    try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ 
            audio: { echoCancellation: true, noiseSuppression: true } 
        });
        streamRef.current = audioStream;
    } catch (e) {
        console.warn("Mic failed", e);
    }

    try {
        socketRef.current = io('/', { withCredentials: true });
        const peer = new Peer(undefined, PEER_CONFIG);
        peerRef.current = peer;

        peer.on('open', (id) => {
            setIsConnecting(false);
            setIsStreaming(true);
            
            if (setLiveStatus) setLiveStatus(true);
            setupCompositedVideoInput();

            socketRef.current?.emit('join-room', ROOM_ID, {
                peerId: id,
                name: user.name,
                role: 'TEACHER'
            });
        });

        socketRef.current.on('user-connected', (data: any) => {
            if (data.role === 'STUDENT' && data.peerId) {
                setSpectators(prev => [...prev, { 
                    id: data.socketId, 
                    name: data.name || 'Étudiant', 
                    isMuted: false, 
                    joinTime: new Date().toLocaleTimeString() 
                }]);

                if (canvasRef.current && peerRef.current) {
                    const stream = canvasRef.current.captureStream(30);
                    if (streamRef.current) {
                        stream.addTrack(streamRef.current.getAudioTracks()[0]);
                    }
                    peerRef.current.call(data.peerId, stream);
                }
            }
        });

        socketRef.current.on('user-disconnected', (socketId: string) => {
             setSpectators(prev => prev.filter(s => s.id !== socketId));
        });

        socketRef.current.on('receive-message', (msg: ChatMessage) => {
             setMessages(prev => [...prev, msg]);
        });

    } catch (e) {
        setError("Erreur initialisation.");
        setIsConnecting(false);
    }
  };


  const setupCompositedVideoInput = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = window.setInterval(async () => {
        if (!isStreamingRef.current) return;
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const camVideo = cameraVideoRef.current;
        const screenVideo = screenVideoRef.current;
        const isCamActive = camVideo && camVideo.readyState >= 2 && !camVideo.paused;
        const isScreenActive = screenVideo && screenVideo.readyState >= 2 && !screenVideo.paused;

        if (!isCamActive && !isScreenActive) return;

        let width = 1280;
        let height = 720;
        
        if (isScreenActive && screenVideo) {
            width = screenVideo.videoWidth;
            height = screenVideo.videoHeight;
        } else if (isCamActive && camVideo) {
             width = camVideo.videoWidth;
             height = camVideo.videoHeight;
        }

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        if (isScreenActive && screenVideo) {
            ctx.drawImage(screenVideo, 0, 0, width, height);
        } else if (isCamActive && camVideo) {
            ctx.drawImage(camVideo, 0, 0, width, height);
        }

        if (isScreenActive && isCamActive && camVideo) {
            const pipWidth = width * 0.25;
            const pipHeight = (camVideo.videoHeight / camVideo.videoWidth) * pipWidth;
            const padding = 20;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.strokeRect(width - pipWidth - padding, height - pipHeight - padding, pipWidth, pipHeight);
            ctx.drawImage(camVideo, width - pipWidth - padding, height - pipHeight - padding, pipWidth, pipHeight);
        }
    }, 33);
  };

  const stopSession = async (stopCamera: boolean = true) => {
    setIsStreaming(false);
    setIsConnecting(false);
    
    if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
    }
    if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
    }

    if (screenVideoRef.current && screenVideoRef.current.srcObject) {
        const stream = screenVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
        screenVideoRef.current.srcObject = null;
    }
    setIsScreenSharing(false);

    if (setLiveStatus) setLiveStatus(false);

    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }

    if (stopCamera) {
        if (cameraStreamRef.current) {
            cameraStreamRef.current.getTracks().forEach(track => track.stop());
            cameraStreamRef.current = null;
        }
        if (cameraVideoRef.current) {
            cameraVideoRef.current.srcObject = null;
        }
        setCameraOn(false);
    }
    
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
        const newState = !micOn;
        streamRef.current.getAudioTracks().forEach(track => track.enabled = newState);
        setMicOn(newState);
    }
  };

  const toggleCamera = async () => {
    setError(null);
    if (cameraOn) {
        if (cameraStreamRef.current) {
            cameraStreamRef.current.getTracks().forEach(track => track.stop());
            cameraStreamRef.current = null;
        }
        if (cameraVideoRef.current) {
            cameraVideoRef.current.srcObject = null;
        }
        setCameraOn(false);
    } else {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("API Caméra non supportée.");
            }
            const videoStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 }, 
                    height: { ideal: 720 },
                    facingMode: "user" 
                } 
            });
            cameraStreamRef.current = videoStream;
            if (cameraVideoRef.current) {
                cameraVideoRef.current.srcObject = videoStream;
                cameraVideoRef.current.play().catch(e => console.error("Play error", e));
            }
            setCameraOn(true);
        } catch (e: any) {
            setError("Accès caméra refusé.");
        }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
        if (screenVideoRef.current && screenVideoRef.current.srcObject) {
             const stream = screenVideoRef.current.srcObject as MediaStream;
             stream.getTracks().forEach(track => track.stop());
             screenVideoRef.current.srcObject = null;
        }
        setIsScreenSharing(false);
    } else {
        try {
            const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            if (screenVideoRef.current) {
                screenVideoRef.current.srcObject = displayStream;
                screenVideoRef.current.play().catch(console.error);
            }
            displayStream.getVideoTracks()[0].onended = () => {
                if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
                setIsScreenSharing(false);
            };
            setIsScreenSharing(true);
        } catch (e) {
            console.error("Error sharing screen", e);
        }
    }
  };

  const handleKick = (id: string) => {
      // Emit socket event to kick
      socketRef.current?.emit('kick-user', id);
      setSpectators(prev => prev.filter(s => s.id !== id));
  };

  const handleMute = (id: string) => {
      // Emit socket event to mute
      socketRef.current?.emit('mute-user', id);
      setSpectators(prev => prev.map(s => s.id === id ? {...s, isMuted: !s.isMuted} : s));
  };

  return (
    <div className="max-w-screen-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-6">
       <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-brand-900 flex items-center gap-2">
                    <Sparkles className="text-bac-blue" />
                    Studio de Diffusion
                </h1>
                <p className="text-brand-500 text-sm">Contrôlez votre classe virtuelle</p>
            </div>
            
            <div className="flex gap-3">
                 <button 
                    onClick={toggleCamera}
                    className={`px-4 py-2 border rounded-xl font-bold shadow-sm flex items-center gap-2 transition-colors ${
                        cameraOn 
                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                        : 'bg-white border-brand-200 text-brand-700 hover:bg-brand-50'
                    }`}
                >
                    {cameraOn ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    {cameraOn ? 'Couper Caméra' : 'Activer Caméra'}
                </button>

                 {isStreaming && (
                    <div className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full flex items-center gap-2 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-red-600"></div>
                        <span className="text-xs font-bold uppercase">En Direct</span>
                    </div>
                )}
            </div>
       </div>

       <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
            <SpectatorList spectators={spectators} onKick={handleKick} onMute={handleMute} />

            <div className="flex-1 bg-black/90 border border-brand-200 rounded-3xl overflow-hidden relative flex flex-col shadow-2xl">
                    <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                        <video 
                            ref={screenVideoRef}
                            className={`absolute inset-0 w-full h-full object-contain z-10 ${isScreenSharing ? 'block' : 'hidden'}`}
                            autoPlay playsInline muted
                        />
                        <video 
                            ref={cameraVideoRef} 
                            className={`transition-all duration-300 ease-in-out z-20 object-cover bg-black border border-white/10 shadow-2xl
                                ${cameraOn ? 'opacity-100' : 'opacity-0'}
                                ${isScreenSharing 
                                    ? 'absolute bottom-4 right-4 w-48 h-36 rounded-xl border-2 border-white' 
                                    : 'absolute inset-0 w-full h-full object-contain rounded-none border-none'
                                }
                            `}
                            muted autoPlay playsInline 
                        />
                        
                        {!cameraOn && !isScreenSharing && isStreaming && (
                            <div className="flex flex-col items-center text-gray-500 animate-[fadeIn_0.5s] z-0">
                                <VideoOff className="w-12 h-12 mb-2" />
                                <p>Caméra désactivée</p>
                            </div>
                        )}
                        
                        {error && !isConnecting && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-100 border border-amber-400 text-amber-800 px-4 py-2 rounded-xl z-50 flex items-center gap-3 shadow-lg max-w-md animate-bounce-slow">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <div className="text-xs font-bold">{error}</div>
                                <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
                            </div>
                        )}

                        {!isStreaming && !isConnecting && (
                            <div className={`absolute inset-0 flex flex-col items-center justify-center z-30 text-center p-6 transition-all duration-300 ${
                                cameraOn ? 'bg-black/40 text-white backdrop-blur-[2px]' : 'bg-brand-50/90 text-brand-900 backdrop-blur-sm'
                            }`}>
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-2xl border transition-colors ${
                                    cameraOn ? 'bg-white/20 border-white/50' : 'bg-white border-brand-100 shadow-bac-blue/20'
                                }`}>
                                    <Video className={`w-8 h-8 ${cameraOn ? 'text-white' : 'text-brand-400'}`} />
                                </div>
                                <h2 className={`text-2xl font-bold mb-2 ${cameraOn ? 'text-white' : 'text-brand-900'}`}>Prêt à diffuser ?</h2>
                                <p className={`max-w-md mb-8 ${cameraOn ? 'text-gray-200' : 'text-brand-500'}`}>
                                    Vérifiez votre équipement avant de lancer le direct.
                                </p>
                                <button 
                                    onClick={startSession}
                                    className="group relative px-8 py-4 bg-bac-blue hover:bg-sky-700 text-white rounded-2xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-bac-blue/30 flex items-center gap-3 overflow-hidden"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    Lancer le Direct
                                </button>
                            </div>
                        )}
                        {isConnecting && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-40">
                                <Loader2 className="w-10 h-10 text-bac-blue animate-spin mb-4" />
                                <p className="text-white font-medium">Initialisation du studio...</p>
                            </div>
                        )}
                    </div>

                    {isStreaming && (
                        <div className="h-20 bg-brand-900 flex items-center justify-center gap-6 px-6 relative z-20 border-t border-brand-800">
                            <button onClick={toggleMic} className={`p-3 rounded-full transition-all ${micOn ? 'bg-brand-700 text-white hover:bg-brand-600' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                                {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                            </button>
                            <button onClick={toggleScreenShare} className={`p-3 rounded-full transition-all ${isScreenSharing ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-brand-700 text-white hover:bg-brand-600'}`}>
                                {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                            </button>
                            <div className="w-px h-8 bg-brand-700 mx-2"></div>
                            <button onClick={() => stopSession(true)} className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-red-900/20">
                                <Square className="w-4 h-4 fill-current" />
                                Arrêter
                            </button>
                        </div>
                    )}
            </div>

            <ChatPanel messages={messages} onSend={handleSend} currentUserName={user.name} />
       </div>
       
       <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default LiveLab;