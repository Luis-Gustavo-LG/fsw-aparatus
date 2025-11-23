
import { UIMessage } from "ai"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import { cn } from "@/lib/utils";

export const ChatMessages = ({ message }: { message: UIMessage }) => {
    const isUser = message.role === 'user';

    return (
        <div className={cn("flex gap-3 w-full my-4", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <div className="shrink-0 bg-muted rounded-full p-2 h-10 w-10 flex items-center justify-center">
                    <span className="text-xs">✨</span>
                </div>
            )}
            <div className={cn(
                "rounded-2xl p-4 max-w-[80%] text-sm",
                isUser 
                    ? "bg-muted text-foreground rounded-tr-none" 
                    : "bg-transparent text-foreground pl-0"
            )}>
                {message.parts.map((part, index) =>
                    part.type === 'text' ?
                        <p key={index}>{part.text}</p>
                        :
                        null
                )}
            </div>
        </div>
    )
}
