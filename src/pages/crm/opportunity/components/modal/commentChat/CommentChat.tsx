import { useCreateOpportunityComment, useListComment } from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

type Props = {
  linkToken: string;
};

export function OpportunityCommentsChat({ linkToken }: Props) {
  const currentUserId = useAuth((s) => s.userId);
  const { data, isLoading } = useListComment(linkToken);
  const createMut = useCreateOpportunityComment();

  const [message, setMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    createMut.mutate({
      linkToken,
      message: message.trim(),
      isInternal,
    });

    setMessage("");
  };
  // 👇 Agrega este useEffect en tu componente
  useEffect(() => {
    if (textareaRef.current) {
      // Reinicia la altura a 'auto' para recalcular al borrar texto
      textareaRef.current.style.height = "auto";
      // Ajusta la altura basada en el contenido actual (scrollHeight)
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  useEffect(() => {
  if (!data || data.length === 0) return;
  
    
  const el = scrollRef.current;
  if (!el) return;

  el.scrollTop = el.scrollHeight;
}, [data?.length]);
  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
            <MessageCircle className="h-3.5 w-3.5 text-blue-600" />
          </span>
          <div>
            <h3 className="text-xs font-semibold text-slate-800">
              Comentarios de la oportunidad
            </h3>
          </div>
        </div>

        {isLoading && (
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Loader2 className="h-3 w-3 animate-spin" /> Cargando...
          </span>
        )}
      </div>

      {/* body */}
      <div
        ref={scrollRef}
       className="flex-1 overflow-y-auto px-3 py-3 text-xs space-y-2 no-scrollbar"
      >
        {!isLoading && (!data || data.length === 0) && (
          <div className="flex h-full items-center justify-center">
            <p className="text-[11px] text-slate-400 text-center">
              Aún no hay comentarios en esta oportunidad 🫠
              <br />
              Empieza la conversación.
            </p>
          </div>
        )}

        {data && data.length > 0 && (
          <AnimatePresence initial={false}>
            {data.map((c) => {
              const isMine = c.createdBy === Number(currentUserId);
              return (
                <motion.div
                  key={c.commentToken}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  layout
                >
                  <div
                    className={[
                      "max-w-[75%] rounded-2xl px-3 py-2 shadow-sm",
                      isMine
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white text-slate-900 border border-slate-200 rounded-bl-sm",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {!isMine && (
                        <p className="text-[10px] font-semibold opacity-80">
                          {c.createdByName ?? "Usuario"}
                        </p>
                      )}
                    </div>

                    <p className="mt-1 whitespace-pre-wrap break-words leading-snug">
                      {c.message}
                    </p>

                    <p className="mt-1 text-[9px] opacity-70 text-right">
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        <div ref={endRef} />
      </div>

      {/* footer */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-200 px-3 py-2.5 space-y-1.5"
      >
        <div className="flex items-end gap-2">
          <div className="flex-1 rounded-full bg-white border border-slate-200 px-3 py-1.5 flex items-center">
            <textarea
              ref={textareaRef}
              rows={1}
              className="flex-1 resize-none bg-transparent text-xs outline-none placeholder:text-slate-400 max-h-24 overflow-y-auto"              
              placeholder="Escribe un comentario..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || createMut.isPending}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white text-xs shadow-sm disabled:opacity-50"
          >
            {createMut.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>

        <label hidden className="flex items-center gap-1 text-[11px] text-slate-500">
          <input
            hidden
            type="checkbox"
            className="h-3 w-3"
            checked={isInternal}
            onChange={(e) => setIsInternal(e.target.checked)}
          />
          Comentario interno (solo equipo)
        </label>
      </form>
    </div>
  );
}
