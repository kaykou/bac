import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Play, Square, Loader2, Sparkles, AlertCircle, Radio, Send, MessageCircle, Users, UserX, VolumeX, Settings, X, Monitor, MonitorOff, Ban, Volume2, Check, UserCheck, Move, Globe, Lock } from 'lucide-react';
import { User, Spectator } from '../types';
import Peer from 'peerjs';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

/* --- CONSTANTS & TYPES --- */

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
const STREAM_WIDTH = 1920;
const STREAM_HEIGHT = 1080;

const PEER_CONFIG = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  }
};

/* --- HELPER COMPONENTS --- */

interface ChatPanelProps {
    messages: ChatMessage[];
    onSend: (text: string) => void;
    currentUserName: string;
    isDisabled?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSend, currentUserName, isDisabled = false }) => {
    const [text, setText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim() && !isDisabled) {
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
                        placeholder={isDisabled ? "Chat désactivé pour vous" : "Envoyer un message..."}
                        disabled={isDisabled}
                        className="w-full bg-white border border-brand-200 rounded-xl py-2.5 pl-3 pr-10 text-brand-900 focus:outline-none focus:border-bac-blue text-sm shadow-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    />
                    <button 
                        type="submit" 
                        disabled={!text.trim() || isDisabled}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-bac-blue hover:bg-sky-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};

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
  const [waitingApproval, setWaitingApproval] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isKicked, setIsKicked] = useState(false);
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
      setWaitingApproval(false);
      setIsKicked(false);

      try {
          socketRef.current = io('/', { withCredentials: true });
          
          // Identity registration
          socketRef.current.emit('user-login', { 
            id: user.id, 
            name: user.name, 
            role: 'STUDENT' 
          });

          const peer = new Peer(undefined, PEER_CONFIG);
          peerRef.current = peer;

          // Event Listeners
          socketRef.current.on('force-disconnect', () => {
              setIsKicked(true); // Immediate UI update to remove video
              if (peerRef.current) peerRef.current.destroy();
              if (socketRef.current) socketRef.current.disconnect();
              
              // Navigate away after a short delay for UX
              setTimeout(() => {
                  navigate('/'); 
              }, 3000);
          });

          socketRef.current.on('muted-status', (status: boolean) => {
              setIsMuted(status);
          });

          socketRef.current.on('waiting-approval', () => {
              setWaitingApproval(true);
              setIsConnecting(false);
          });

          socketRef.current.on('entry-refused', () => {
              setWaitingApproval(false);
              setIsPlaying(false);
              setError("Le professeur a refusé votre demande de rejoindre.");
              socketRef.current?.disconnect();
          });

          socketRef.current.on('entry-accepted', () => {
              setWaitingApproval(false);
              setIsConnecting(true);
              
              // Ensure peer is ready before emitting join-room
              const checkPeerAndJoin = () => {
                  if (peerRef.current && peerRef.current.id && !peerRef.current.disconnected) {
                      socketRef.current?.emit('join-room', ROOM_ID, { 
                          peerId: peerRef.current.id, 
                          name: user.name, 
                          role: 'STUDENT'
                      });
                  } else {
                      // Retry shortly if peer ID not yet generated
                      setTimeout(checkPeerAndJoin, 500);
                  }
              };
              checkPeerAndJoin();
          });

          socketRef.current.on('error-message', (msg: string) => {
              alert(msg);
          });

          socketRef.current.on('receive-message', (msg: ChatMessage) => {
             setMessages(prev => [...prev, msg]);
          });

          peer.on('open', (peerId) => {
              // Initial Join attempt
              // If mode is 'OPEN', this works. If 'APPROVAL', server responds with waiting-approval.
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
    if (isMuted) return;
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

  if (isKicked) {
      return (
          <div className="h-[calc(100vh-8rem)] flex items-center justify-center animate-[fadeIn_0.3s_ease-out]">
              <div className="text-center p-8 bg-white border border-red-100 rounded-3xl shadow-2xl max-w-md">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                      <Ban className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-brand-900 mb-2">Session Terminée</h2>
                  <p className="text-brand-500 mb-6">Vous avez été exclu de ce cours par l'enseignant.</p>
                  <p className="text-xs text-brand-400 font-bold uppercase tracking-widest">Redirection...</p>
              </div>
          </div>
      );
  }

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
                    {isConnecting && !waitingApproval && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-20">
                            <Loader2 className="w-12 h-12 text-bac-blue animate-spin mb-4" />
                            <p className="text-white text-lg font-medium tracking-wide">Connexion au cours...</p>
                        </div>
                    )}
                    {waitingApproval && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 p-6 text-center">
                            <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mb-4" />
                            <h3 className="text-white text-xl font-bold mb-2">En attente d'approbation</h3>
                            <p className="text-gray-300">Le professeur doit valider votre demande de retour.</p>
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

           <ChatPanel messages={messages} onSend={handleSend} currentUserName={user.name} isDisabled={isMuted} />
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
  const [joinRequest, setJoinRequest] = useState<{socketId: string, name: string} | null>(null);
  
  // LIVE MODE: 'OPEN' = Accès Libre, 'APPROVAL' = Salle d'Attente
  const [liveMode, setLiveMode] = useState<'OPEN' | 'APPROVAL'>('OPEN');

  // Draggable Cam State (Percentage based: 0-100)
  const [pipPos, setPipPos] = useState({ x: 75, y: 70 });
  const [isDraggingCam, setIsDraggingCam] = useState(false);
  const pipRef = useRef<{x: number, y: number}>({ x: 75, y: 70 });

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
        
        // REGISTER SOCKET IDENTITY
        socketRef.current.emit('user-login', {
            id: user.id,
            name: user.name,
            role: 'TEACHER'
        });

        // Set live mode on server immediately
        socketRef.current.emit('set-live-status', true, liveMode);

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

        // Listen for requests (Wait Room)
        socketRef.current.on('join-request', (data: {socketId: string, name: string}) => {
            setJoinRequest(data);
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

  const handleApproveJoin = (approved: boolean) => {
      if (!joinRequest) return;
      
      socketRef.current?.emit('teacher-response', {
          studentSocketId: joinRequest.socketId,
          decision: approved ? 'accept' : 'refuse'
      });
      
      setJoinRequest(null);
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

        let width = STREAM_WIDTH;
        let height = STREAM_HEIGHT;
        
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

        // Draw PIP Camera when screen sharing
        if (isScreenActive && isCamActive && camVideo) {
            const pipW = width * 0.25; // 25% width
            const pipH = (camVideo.videoHeight / camVideo.videoWidth) * pipW;
            
            // Map percentage state to pixels
            const currentX = (pipRef.current.x / 100) * width;
            const currentY = (pipRef.current.y / 100) * height;

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.strokeRect(currentX, currentY, pipW, pipH);
            ctx.drawImage(camVideo, currentX, currentY, pipW, pipH);
        }
    }, 33);
  };

  const stopSession = async (stopCamera: boolean = true) => {
    setIsStreaming(false);
    setIsConnecting(false);
    setJoinRequest(null);
    
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
                    width: { ideal: STREAM_WIDTH }, 
                    height: { ideal: STREAM_HEIGHT },
                    frameRate: { ideal: 30 },
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
      socketRef.current?.emit('kick-user', id);
      setSpectators(prev => prev.filter(s => s.id !== id));
  };

  const handleMute = (id: string) => {
      socketRef.current?.emit('mute-user', id);
      setSpectators(prev => prev.map(s => s.id === id ? {...s, isMuted: !s.isMuted} : s));
  };

  // Drag Logic for Teacher Camera
  const handleMouseDown = (e: React.MouseEvent) => {
      setIsDraggingCam(true);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDraggingCam) return;
      const container = e.currentTarget.getBoundingClientRect();
      
      const newX = ((e.clientX - container.left) / container.width) * 100;
      const newY = ((e.clientY - container.top) / container.height) * 100;
      
      // Clamp values (keeping PIP somewhat inside)
      const clampedX = Math.max(0, Math.min(75, newX)); // 75 because pip width is 25%
      const clampedY = Math.max(0, Math.min(80, newY));

      setPipPos({ x: clampedX, y: clampedY });
      pipRef.current = { x: clampedX, y: clampedY }; // Sync ref for canvas loop
  };

  const handleMouseUp = () => {
      setIsDraggingCam(false);
  };

  return (
    <div className="max-w-screen-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-6">
       <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-brand-900 flex items-center gap-2">
                    <Sparkles className="text-bac-blue" />
                    Studio de Diffusion
                </h1>
                <p className="text-brand-500 text-sm">Contrôlez votre classe virtuelle (1080p - 30fps)</p>
            </div>
            
            <div className="flex gap-3">
                 {!isStreaming && (
                     <>
                        {/* MODE SELECTOR */}
                        <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-brand-200">
                             <button
                                onClick={() => setLiveMode('OPEN')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                                    liveMode === 'OPEN' ? 'bg-white text-brand-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                }`}
                             >
                                 <Globe className="w-4 h-4" /> Libre
                             </button>
                             <button
                                onClick={() => setLiveMode('APPROVAL')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                                    liveMode === 'APPROVAL' ? 'bg-white text-brand-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                }`}
                             >
                                 <Lock className="w-4 h-4" /> Salle d'Attente
                             </button>
                        </div>

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
                     </>
                 )}

                 {isStreaming && (
                    <div className="flex items-center gap-3">
                         <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500 border border-gray-200">
                             Mode: {liveMode === 'OPEN' ? 'Accès Libre (Public)' : 'Salle d\'Attente (Privée)'}
                         </div>
                        <div className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full flex items-center gap-2 animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            <span className="text-xs font-bold uppercase">En Direct</span>
                        </div>
                    </div>
                )}
            </div>
       </div>

       <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
            <SpectatorList spectators={spectators} onKick={handleKick} onMute={handleMute} />

            <div className="flex-1 bg-black/90 border border-brand-200 rounded-3xl overflow-hidden relative flex flex-col shadow-2xl">
                    <div 
                        className="flex-1 relative bg-black flex items-center justify-center overflow-hidden cursor-crosshair"
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <video 
                            ref={screenVideoRef}
                            className={`absolute inset-0 w-full h-full object-contain z-10 ${isScreenSharing ? 'block' : 'hidden'}`}
                            autoPlay playsInline muted
                        />
                        
                        {/* Camera Element: Moves based on drag */}
                        <div 
                            onMouseDown={isScreenSharing ? handleMouseDown : undefined}
                            style={{
                                left: isScreenSharing ? `${pipPos.x}%` : '0',
                                top: isScreenSharing ? `${pipPos.y}%` : '0',
                                width: isScreenSharing ? '25%' : '100%',
                                height: isScreenSharing ? 'auto' : '100%',
                                position: 'absolute',
                                cursor: isScreenSharing ? 'move' : 'default',
                                zIndex: 20
                            }}
                            className={`transition-opacity duration-300 ease-in-out
                                ${cameraOn ? 'opacity-100' : 'opacity-0'}
                                ${isScreenSharing ? 'shadow-2xl border-2 border-white rounded-xl' : 'rounded-none border-none'}
                            `}
                        >
                             <video 
                                ref={cameraVideoRef} 
                                className="w-full h-full object-cover bg-black"
                                muted autoPlay playsInline 
                            />
                            {isScreenSharing && cameraOn && (
                                <div className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white pointer-events-none">
                                    <Move className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                        
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
                        
                        {/* JOIN REQUEST ALERT (ONLY IN APPROVAL MODE) */}
                        {joinRequest && (
                            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-bac-blue p-4 z-50 animate-bounce-slow">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                                        <UserCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Demande d'entrée</h4>
                                        <p className="text-sm text-gray-600 mb-3">
                                            <span className="font-bold text-bac-blue">{joinRequest.name}</span> veut rejoindre le cours.
                                        </p>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleApproveJoin(true)}
                                                className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-1"
                                            >
                                                <Check className="w-4 h-4" /> Accepter
                                            </button>
                                            <button 
                                                onClick={() => handleApproveJoin(false)}
                                                className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-1"
                                            >
                                                <X className="w-4 h-4" /> Refuser
                                            </button>
                                        </div>
                                    </div>
                                </div>
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
                                    Mode: {liveMode === 'OPEN' ? 'Accès Libre (Public)' : 'Salle d\'Attente (Privée)'}
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

                        {/* --- CONTROLS BAR (MODERN THEME MATCHED) --- */}
                        {isStreaming && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 bg-brand-900/60 backdrop-blur-2xl rounded-full shadow-2xl border border-white/10 z-30 pointer-events-auto">
                                <button 
                                    onClick={toggleMic} 
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                                        micOn 
                                        ? 'bg-bac-blue text-white hover:bg-sky-500' 
                                        : 'bg-brand-800 text-brand-400 hover:text-white border border-white/20'
                                    }`}
                                    title={micOn ? "Couper micro" : "Activer micro"}
                                >
                                    {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                                </button>

                                <button 
                                    onClick={toggleScreenShare} 
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                                        isScreenSharing 
                                        ? 'bg-bac-blue text-white hover:bg-sky-500' 
                                        : 'bg-brand-800 text-brand-400 hover:text-white border border-white/20'
                                    }`}
                                    title="Partager écran"
                                >
                                    {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                                </button>

                                <div className="w-px h-8 bg-white/20 mx-2"></div>

                                <button 
                                    onClick={() => stopSession(true)} 
                                    className="px-6 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold flex items-center gap-2 transition-colors shadow-lg shadow-red-900/40"
                                >
                                    <Square className="w-4 h-4 fill-current" />
                                    <span>Arrêter</span>
                                </button>
                            </div>
                        )}
                    </div>
            </div>

            <ChatPanel messages={messages} onSend={handleSend} currentUserName={user.name} isDisabled={false} />
       </div>
       
       <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

/* --- MAIN EXPORT --- */

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

export default LiveLab;