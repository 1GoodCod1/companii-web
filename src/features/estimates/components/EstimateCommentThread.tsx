import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PaperPlaneRightIcon, ChatCircleIcon } from '@phosphor-icons/react';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useEstimateComments, useAddComment } from '../api/useEstimateComments';
import type { EstimateCommentDto } from '@/entities/estimate/model/estimates';

interface Props {
  projectId: string;
  isPortal?: boolean;
}

export function EstimateCommentThread({ projectId, isPortal = false }: Props) {
  const { t } = useTranslation();
  const auth = useAuthStore((s) => s.user);
  const [newComment, setNewComment] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: comments, isLoading } = useEstimateComments(projectId, isPortal);
  const addComment = useAddComment(projectId, isPortal);

  const handleSend = async () => {
    const trimmed = newComment.trim();
    if (!trimmed || addComment.isPending) return;
    await addComment.mutateAsync(trimmed);
    setNewComment('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <ChatCircleIcon className="size-4" />
        {t('comments.title', 'Comments')}
      </div>

      {/* Messages */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {isLoading && (
          <div className="text-xs text-muted-foreground text-center py-4">
            {t('common.loading', 'Loading...')}
          </div>
        )}

        {comments && comments.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-4">
            {t('comments.empty', 'No comments yet. Start the conversation!')}
          </div>
        )}

        {comments?.map((c: EstimateCommentDto) => {
          const isOwn =
            auth?.sub === c.authorId ||
            (isPortal && c.authorKind === 'CLIENT') ||
            (!isPortal && c.authorKind === 'CONTRACTOR');

          return (
            <div
              key={c.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <div className="text-xs opacity-70 mb-0.5">
                  {c.authorKind === 'CLIENT'
                    ? t('comments.client', 'Client')
                    : t('comments.contractor', 'Contractor')}
                </div>
                <div className="whitespace-pre-wrap break-words">{c.body}</div>
                <div className="text-xs opacity-50 mt-1 text-right">
                  {new Date(c.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          className="flex-1 border rounded px-3 py-2 text-sm resize-none"
          rows={2}
          aria-label={t('comments.placeholder', 'Write a comment...')}
          placeholder={t('comments.placeholder', 'Write a comment...')}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={2000}
        />
        <button
          type="button"
          className="btn-primary flex items-center justify-center size-10 rounded-lg flex-shrink-0"
          onClick={handleSend}
          disabled={!newComment.trim() || addComment.isPending}
        >
          <PaperPlaneRightIcon className="size-4" />
        </button>
      </div>
      <div className="text-xs text-muted-foreground text-right">
        {newComment.length}/2000
      </div>
    </div>
  );
}