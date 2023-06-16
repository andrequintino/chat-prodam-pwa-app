import { ChatMessageInput } from "./ChatMessageInput";
import Link from 'next/link';
type Props = {
  disabled: boolean;
  textEl: any;
  onSendMessage: (message: string) => void;
}
export const Footer = ({onSendMessage, disabled, textEl}: Props) => {
  return (
    <footer className="w-full border-t border-t-gray-600 p-2">   
      <div className="max-w-4xl m-auto">
        <ChatMessageInput 
          onSend={onSendMessage}
          disabled={disabled}
          textEl={textEl}
        />
        <div className="flex flex-row pt-3 text-center text-xs text-gray-700">
          <div className="w-1/2 px-4 text-right">@2023. Prodam</div>
          <div className="w-1/2 px-4 text-left">
            <Link href="/upload" className="text-blue-700">
              <span>Treinar Chat</span>
            </Link>          
          </div>          
        </div>
      </div>
    </footer>
  );
}