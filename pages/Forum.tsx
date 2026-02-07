import React, { useState, useEffect } from 'react';
import { User, ForumPost } from '../types';
import { api } from '../services/api';
import { MessageCircle, Plus, User as UserIcon, Send, ShieldCheck, ChevronDown, ChevronUp, Loader2, Trash2 } from 'lucide-react';

interface ForumProps {
  user: User | null;
  onRequireAuth: () => void;
}

const Forum: React.FC<ForumProps> = ({ user, onRequireAuth }) => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAskModal, setShowAskModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
        const data = await api.getForumPosts();
        setPosts(data);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        onRequireAuth();
        return;
    }
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    try {
        await api.createForumPost(newTitle, newContent);
        await fetchPosts();
        setShowAskModal(false);
        setNewTitle('');
        setNewContent('');
    } catch (e) {
        alert("Erreur lors de la publication.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (e: React.MouseEvent, postId: string) => {
      e.stopPropagation(); // Prevent toggling the accordion
      if (!confirm("Supprimer cette discussion et toutes ses réponses ?")) return;

      try {
          await api.deleteForumPost(postId);
          setPosts(prev => prev.filter(p => p.id !== postId));
      } catch (e) {
          alert("Erreur lors de la suppression.");
      }
  };

  const handleAnswer = async (e: React.FormEvent, postId: string) => {
      e.preventDefault();
      if (!user) {
          onRequireAuth();
          return;
      }
      if (!answerContent.trim()) return;

      setIsSubmitting(true);
      try {
          await api.createForumAnswer(postId, answerContent);
          await fetchPosts();
          setAnswerContent('');
      } catch (e) {
          alert("Erreur lors de la réponse.");
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-200 pb-6">
            <div>
                <h1 className="text-3xl font-bold text-brand-900 font-serif flex items-center gap-3">
                    <MessageCircle className="w-8 h-8 text-bac-blue" />
                    Forum d'Entraide
                </h1>
                <p className="text-brand-500 mt-2">Posez vos questions et aidez vos camarades.</p>
            </div>
            <button 
                onClick={() => user ? setShowAskModal(true) : onRequireAuth()}
                className="px-6 py-3 bg-bac-blue hover:bg-sky-700 text-white rounded-xl font-bold shadow-lg shadow-bac-blue/20 transition-all flex items-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Poser une question
            </button>
        </div>

        {isLoading ? (
            <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-bac-blue animate-spin" />
            </div>
        ) : (
            <div className="space-y-6">
                {posts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-brand-100">
                        <p className="text-brand-400">Aucune question pour le moment. Soyez le premier !</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="bg-white border border-brand-200 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
                            {/* Question Header */}
                            <div 
                                onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${post.userRole === 'TEACHER' ? 'bg-bac-blue' : 'bg-brand-300'}`}>
                                        {post.userRole === 'TEACHER' ? <ShieldCheck className="w-5 h-5" /> : post.userName.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-bold text-brand-900 mb-1">{post.title}</h3>
                                            <div className="flex items-center gap-2">
                                                {/* DELETE BUTTON FOR TEACHER */}
                                                {user?.role === 'TEACHER' && (
                                                    <button 
                                                        onClick={(e) => handleDeletePost(e, post.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mr-1"
                                                        title="Supprimer la discussion"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {expandedPostId === post.id ? <ChevronUp className="text-brand-400" /> : <ChevronDown className="text-brand-400" />}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-brand-400">
                                            <span className={`font-bold ${post.userRole === 'TEACHER' ? 'text-bac-blue' : 'text-brand-600'}`}>{post.userName}</span>
                                            <span>•</span>
                                            <span>{post.createdAt}</span>
                                            <span>•</span>
                                            <span className="font-bold text-bac-blue">{post.answers.length} réponses</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content & Answers */}
                            {expandedPostId === post.id && (
                                <div className="bg-brand-50 border-t border-brand-100 p-6">
                                    <p className="text-brand-700 mb-8 whitespace-pre-wrap">{post.content}</p>

                                    <div className="space-y-4 mb-8">
                                        <h4 className="font-bold text-brand-900 text-sm uppercase tracking-wide mb-4">Réponses</h4>
                                        {post.answers.length === 0 ? (
                                            <p className="text-sm text-brand-400 italic">Pas encore de réponse.</p>
                                        ) : (
                                            post.answers.map(answer => (
                                                <div key={answer.id} className={`p-4 rounded-xl border ${answer.userRole === 'TEACHER' ? 'bg-blue-50 border-blue-100' : 'bg-white border-brand-100'}`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`text-xs font-bold ${answer.userRole === 'TEACHER' ? 'text-bac-blue' : 'text-brand-600'}`}>
                                                            {answer.userName} {answer.userRole === 'TEACHER' && '(Professeur)'}
                                                        </span>
                                                        <span className="text-[10px] text-brand-400">{answer.createdAt}</span>
                                                    </div>
                                                    <p className="text-sm text-brand-800">{answer.content}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <form onSubmit={(e) => handleAnswer(e, post.id)} className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={answerContent}
                                            onChange={(e) => setAnswerContent(e.target.value)}
                                            placeholder="Écrire une réponse..."
                                            className="flex-1 px-4 py-2 rounded-xl border border-brand-200 focus:outline-none focus:border-bac-blue"
                                            disabled={isSubmitting}
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={isSubmitting || !answerContent.trim()}
                                            className="px-4 py-2 bg-bac-blue text-white rounded-xl hover:bg-sky-700 disabled:opacity-50"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        )}

        {/* Modal Ask Question */}
        {showAskModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6">
                    <h3 className="text-xl font-bold text-brand-900 mb-4">Poser une question</h3>
                    <form onSubmit={handleCreatePost} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Titre</label>
                            <input 
                                type="text" 
                                required
                                value={newTitle} 
                                onChange={e => setNewTitle(e.target.value)}
                                className="w-full bg-gray-50 border border-brand-200 rounded-xl px-4 py-2 text-brand-900 focus:outline-none focus:border-bac-blue"
                                placeholder="Ex: Problème ex. 3 cinématique"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Détails</label>
                            <textarea 
                                required
                                value={newContent} 
                                onChange={e => setNewContent(e.target.value)}
                                className="w-full bg-gray-50 border border-brand-200 rounded-xl px-4 py-2 text-brand-900 focus:outline-none focus:border-bac-blue h-32 resize-none"
                                placeholder="Expliquez votre problème..."
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button 
                                type="button" 
                                onClick={() => setShowAskModal(false)}
                                className="flex-1 py-2 border border-brand-200 text-brand-600 font-bold rounded-xl hover:bg-gray-50"
                                disabled={isSubmitting}
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit" 
                                className="flex-1 py-2 bg-bac-blue text-white font-bold rounded-xl hover:bg-sky-700 disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Publier'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default Forum;