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
      className="flex items-end gap-2 border-t border-border bg-bg2 p-3"
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

      <div className="flex gap-1">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => imageRef.current?.click()}
          aria-label="Enviar imagem"
        >
          <ImageIcon className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => videoRef.current?.click()}
          aria-label="Enviar vídeo"
        >
          <Film className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => fileRef.current?.click()}
          aria-label="Enviar arquivo"
        >
          <Paperclip className="h-5 w-5" />
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
        placeholder="Escreva uma mensagem..."
        className="min-h-[40px] flex-1 resize-none"
      />

      <Button type="submit" size="icon" disabled={sending || !text.trim()} aria-label="Enviar">
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
}
