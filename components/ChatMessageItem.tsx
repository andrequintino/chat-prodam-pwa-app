import { ChatMessage } from "../types/ChatMessage";
import IconRobot from "./icons/IconRobot";
import IconUser from "./icons/IconUser";

type Props = {
  item: ChatMessage
}

export const ChatMessageItem = ({item}: Props) => {
  return (
    <div>
      {item.author !== 'system' && (
      <div className={`py-5 ${item.author === 'ai' && 'bg-gpt-lightgray'}`}>
        <div className="max-w-4xl m-auto flex">
          <div className={`w-10 h-10 flex justify-center items-center mx-4 md:ml-0 rounded 
            ${item.author === 'ai' ? 'bg-green-900' : 'bg-blue-900'}`}>
             {item.author === 'me' && <IconUser className="text-white" width={24} height={24} />}
            {item.author === 'ai' && <IconRobot className="text-white" width={24} height={24} />}
          </div>
          <div className="flex-1 text-base whitespace-pre-wrap">
            {item.body}
          </div>
        </div>
      </div>)}
    </div>    
    
  );
}