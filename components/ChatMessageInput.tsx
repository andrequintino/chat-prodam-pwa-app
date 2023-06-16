import { useState, KeyboardEvent, useRef, useEffect } from "react";
import IconSend from "./icons/IconSend";

type Props = {
  disabled: boolean;
  textEl: any;
  onSend: (message: string) => void;
}
export const ChatMessageInput = ({disabled, onSend, textEl}: Props) => {
  const [text, setText] = useState('');
  
  useEffect(() => {
    if (textEl.current) {
      textEl.current.style.height = '0px';
      let scrollHeight = textEl.current.scrollHeight;
      textEl.current.style.height = scrollHeight + 'px';
    }    
  }, [text, textEl])
  const handleSendMessage = () => {
    if(!disabled && text.trim() !== '') {
      onSend(text);
      setText('');
    }
  }
  const handleTextKeyUp = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if(event.code.toLowerCase() === 'enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }
  return (
    <div className={`flex border border-gray-800/50 bg-gpt-lightgray p-2 rounded-md ${disabled && 'opacity-50'}`}>
      <textarea 
        ref={textEl}
        autoFocus 
        className="flex-1 border-0 bg-transparent resize-none outline-none h-6 max-h-48 overflow-auto"
        placeholder="Digite uma mensagem"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyUp={handleTextKeyUp}
        disabled={disabled}>

      </textarea>
      <div onClick={handleSendMessage} className={`self-end p-2 text-white bg-green-700 cursor-pointer rounded ${text.length ? 'opacity-100 hover:bg-green/20' : 'opacity-20'}`}>
        <IconSend width={14} height={14} />
      </div>
    </div>
  );
}