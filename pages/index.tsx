"use client"
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Inter } from 'next/font/google'
import { ChatArea } from "../components/ChatArea";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { Chat } from "../types/Chat";
import { v4 as uuidv4 }  from 'uuid';
import { useEffect, useState } from "react";
import { SidebarChatButton } from "../components/SidebarChatButton";
import { openai } from "../utils/openai";
import TextArea from "../components/TextArea";
const inter = Inter({ subsets: ['latin'] });


const Home: NextPage = () => {
  const [sidebarOpened, setSidebarOpened] = useState(false);
  const [AILoading, setAILoading] = useState(false);
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [chatActiveId, setChatActiveId] = useState<string>('');
  const [chatActive, setChatActive] = useState<Chat>();
  const openSideBar = () => setSidebarOpened(true);
  const closeSidebar = () => { setSidebarOpened(false); }
  const textEl = TextArea();
  useEffect(() => {
    setChatActive(chatList.find(item => item.id === chatActiveId));
  }, [chatActiveId, chatList]);

  useEffect(() => {
    if(AILoading) 
      getAIResponse();       
    else
      textEl.current?.focus();
      
  }, [AILoading]);

  const getAIResponse = async () => {
    let chatListClone = [...chatList];
    let chatIndex = chatListClone.findIndex(item => item.id === chatActiveId);
    if (chatIndex > -1) {
      let response = await openai.generate(openai.translateMessages(chatListClone[chatIndex].messages));
      if (response) {
        updateChat(response, 'ai');
      }
    }
    setAILoading(false);
       
    
  }

  const updateChat = (message: string, author: 'me' | 'ai') => {
    let chatListClone = [...chatList];
    let chatIndex = chatListClone.findIndex(item => item.id === chatActiveId);
    if (chatIndex > -1)
    {
      chatListClone[chatIndex].messages.push({
        id: uuidv4(), author, body: message
      });
      setChatList(chatListClone);
    }    
  }

  const handleClearConversations = () => {
    if(AILoading) return;
    setChatActiveId('');
    setChatList([]);
    closeSidebar();
    if (textEl) {
      textEl.current?.focus();
    }
  }

  const handleNewChat = () => {
    if(AILoading) return;

    setChatActiveId('');
    closeSidebar();    
    if (textEl) {
      textEl.current?.focus();
    }
  }

  const handleSendMessage = (message: string) => {
    if(!chatActiveId) {
      //Create new chat
      let newChatId = uuidv4();
      setChatList([{
        id: newChatId,
        title: message,
        messages: [
          { id: uuidv4(), author: 'system', body: 'Você é o chatProdam, um assistente que deve responder corretamente sobre a empresa Prodam (Empresa de Tecnologia da Informação e Comunicação do Município de São Paulo). Substitua Prodam-SP por Prodam. Tente usar suas próprias palavras quando possível. Seja preciso, útil, conciso e claro. Caso não encontre a informação no texto fornecido, responda da seguinte com o seguinte texto: Não consegui encontrar a informação desejada.' },
          { id: uuidv4(), author: 'me', body: message }
        ]
      },...chatList]);

      setChatActiveId(newChatId);
    } else {
      //Update existing chat
      updateChat(message, 'me');      
    }
    setAILoading(true);
  }
  const handleSelectChat = (id:string) => {
    if(AILoading) return;
    let item = chatList.find(item => item.id === id);
    if (item) setChatActiveId(item.id);
    closeSidebar();    
  }

  const handleDeleteChat = (id:string) => {
    let chatListClone = [...chatList];
    let chatIndex = chatListClone.findIndex(item => item.id === id);
    if (chatIndex > -1)
    {
      chatListClone.splice(chatIndex, 1);
      setChatList(chatListClone);
      setChatActiveId('');
    }    
  }

  const handleEditChat = (id:string, newTitle:string) => {
    if(newTitle) {
      let chatListClone = [...chatList];
      let chatIndex = chatListClone.findIndex(item => item.id === id);
      if (chatIndex > -1)
      {
        chatListClone[chatIndex].title = newTitle;
        setChatList(chatListClone);        
      }
    }
  }
  return (
    <div>
      <Head>
        <title>ChatProdam</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen bg-gpt-gray">
        <Sidebar 
            open={sidebarOpened}
            onClose={closeSidebar}
            onClear={handleClearConversations}
            onNewChat={handleNewChat}>
          
          {chatList.map(item => (
            <SidebarChatButton 
              key={item.id}
              chatItem={item}
              active={item.id === chatActiveId}
              onClick={handleSelectChat}
              onDelete={handleDeleteChat}
              onEdit={handleEditChat} />
          )
          )}

        </Sidebar>
        <section className="flex flex-col w-full">
          <Header
            openSidebarClick={openSideBar}
            title={chatActive ? chatActive.title : 'Nova conversa'}
            newChatClick={handleNewChat}
          />
          <ChatArea chat={chatActive} loading={AILoading} />
          <Footer 
            disabled={AILoading}
            onSendMessage={handleSendMessage}
            textEl={textEl}
          />
        </section>
      </main>
    </div>
  )
}

export default Home
