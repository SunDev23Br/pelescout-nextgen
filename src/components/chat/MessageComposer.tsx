import { useEffect, useRef, useState } from "react";
import { Paperclip, Send, Image as ImageIcon, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage, uploadChatMedia, type MessageKind } from "@/lib/chat";
import { toast } from "sonner";

interface Props {
  conversationId: string;
  senderId: string;
  onSent?: () => void;
  onTyping?: () => void;
  disabled?: boolean;
  disabledReason?: string;
}

export function MessageComposer({
  conversationId,
  onSent,
  onTyping,
  disabled,
  disabledReason,
}: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    try {
      await sendMessage({ conversationId, kind: "text", content: value });
      setText("");
      onSent?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao enviar");
    } finally {
      setSending(false);
    }
  };

  const handleUpload = async (file: File, kind: MessageKind) => {
    setSending(true);
    try {
      const media = await uploadChatMedia(conversationId, file);
      await sendMessage({
        conversationId,
        kind,
        mediaPath: media.path,
        mediaMime: media.mime,
        mediaSize: media.size,
      });
      onSent?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao enviar mídia");
    } finally {
      setSending(false);
    }
  };

  if (disabled) {
    return (
      <div className="border-t border-border bg-bg2 p-4 text-center text-sm text-muted-foreground">
        {disabledReason ?? "Você não pode enviar mensagens nesta conversa."}
      </div>
    );
  }

  return (
    <form
      className="flex items-end gap-2 border-t border-border bg-bg2 p-3 focus-within:bg-bg2/80"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <input
        type="file"
        ref={imageRef}
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleUpload(f, "image");
          e.target.value = "";
        }}
      />
      <input
        type="file"
        ref={videoRef}
        accept="video/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleUpload(f, "video");
          e.target.value = "";
        }}
      />
      <input
        type="file"
        ref={fileRef}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleUpload(f, "file");
          e.target.value = "";
        }}
      />

      <div className="flex gap-0.5">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => imageRef.current?.click()}
          aria-label="Enviar imagem"
          title="Enviar imagem"
          className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary"
          disabled={sending}
        >
          <ImageIcon className="h-[22px] w-[22px]" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => videoRef.current?.click()}
          aria-label="Enviar vídeo"
          title="Enviar vídeo"
          className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary"
          disabled={sending}
        >
          <Film className="h-[22px] w-[22px]" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => fileRef.current?.click()}
          aria-label="Enviar arquivo"
          title="Enviar arquivo"
          className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary"
          disabled={sending}
        >
          <Paperclip className="h-[22px] w-[22px]" />
        </Button>
      </div>

      <Textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onTyping?.();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void submit();
          }
        }}
        rows={1}
        placeholder="Digite sua mensagem..."
        className="min-h-[44px] flex-1 resize-none rounded-2xl border-border bg-bg3/60 px-4 py-2.5 text-sm transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
      />

      <Button
        type="submit"
        size="icon"
        disabled={sending || !text.trim()}
        aria-label="Enviar"
        className="h-11 w-11 shrink-0 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-105 hover:brightness-110 disabled:scale-100 disabled:opacity-50 disabled:shadow-none"
      >
        {sending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/50 border-t-primary-foreground" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
    </form>
  );
}

