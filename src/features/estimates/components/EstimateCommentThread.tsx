import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PaperPlaneRightIcon, ChatCircleIcon } from '@phosphor-icons/react';
import { Panel } from '@/widgets/cabinet/cabinet-ui';
import { cn } from '@/lib/utils';
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
    <Panel className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <ChatCircleIcon className="size-4 text-violet-600" />
        <h3 className="text-sm font-bold text-gray-900">{t('comments.title', 'Comments')}</h3>
        {comments?.length ? (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-violet-700">
            {comments.length}
          </span>
        ) : null}
      </div>

      {/* Messages */}
      <div className="custom-scrollbar max-h-80 space-y-3 overflow-y-auto rounded-2xl bg-slate-50/70 p-3.5">
        {isLoading && (
          <div className="py-6 text-center text-xs text-gray-400">
            {t('common.loading', 'Loading...')}
          </div>
        )}

        {comments && comments.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <ChatCircleIcon className="size-6 text-gray-300" />
            <p className="text-xs text-gray-400">
              {t('comments.empty', 'No comments yet. Start the conversation!')}
            </p>
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
                className={cn(
                  'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm',
                  isOwn
                    ? 'rounded-br-md bg-violet-600 text-white'
                    : 'rounded-bl-md border border-gray-100 bg-white text-gray-800',
                )}
              >
                <div
                  className={cn(
                    'mb-0.5 text-[10px] font-bold uppercase tracking-wide',
                    isOwn ? 'text-violet-200' : 'text-gray-400',
                  )}
                >
                  {c.authorKind === 'CLIENT'
                    ? t('comments.client', 'Client')
                    : t('comments.contractor', 'Contractor')}
                </div>
                <div className="whitespace-pre-wrap break-words">{c.body}</div>
                <div
                  className={cn(
                    'mt-1 text-right text-[10px]',
                    isOwn ? 'text-violet-200/80' : 'text-gray-400',
                  )}
                >
                  {new Date(c.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex items-end gap-2">
        <textarea
          className="flex-1 resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
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
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-violet-600 text-white transition-colors hover:bg-violet-700 disabled:cursor-default disabled:opacity-40"
          title={t('comments.placeholder', 'Write a comment...')}
          onClick={handleSend}
          disabled={!newComment.trim() || addComment.isPending}
        >
          <PaperPlaneRightIcon className="size-4" />
        </button>
      </div>
      <div className="mt-1 text-right text-[11px] tabular-nums text-gray-400">
        {newComment.length}/2000
      </div>
    </Panel>
  );
}
