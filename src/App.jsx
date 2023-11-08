import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';


const API_KEY = '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'

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      direction: 'outgoing',
      sender: "user"
  };

    const newMessages = [...messages, newMessage ]; // all the old messgaes and the new messages

    // update our messages state
    setMessages(newMessages);

    //set a typing indicator to chatGPT (send it over and see)
    setIsTyping(true);

    // process message to chatGPT (send it over and see the response)
    await processMessageToChatGPT(newMessages);
  }

  async function processMessageToChatGPT(chatMessages) {
   //chatMessages { sender: 'user' or 'ChatGPT', message: 'The message content is here'}
   // apiMessages { role: 'user' or "assistance", content: 'The message content is here" } 

   let apiMessages = chatMessages.map((messageObject) => {
    let role = "";
    if(messageObject.sender === "chatGPT") {
      role = "assistant"
    } else {
      role = "user"
    }
    return { role: role, content: messageObject.message }
   });

   // role: 'user' -> a message from the user, 'assistant' -> a response from chatGPT
   // 'system' -> generally one initial message defining HOW we want chatGPT to talk

   const systemMessage = {
    role: 'system',
    content: 'Expain all concepts like I am 10years old.' 
   }

   const apiRequestBody = {
    "model": "gpt-3.5-turbo",
    "messages": [
      systemMessage,
      ...apiMessages // [message1, message2, message3]
    ]
   }

   await fetch("https://api.openai.com/v1/chat/completions", 
   {
     method: "POST",
     headers: {
       "Authorization": "Bearer " + API_KEY,
       "Content-Type": "application/json"
     },
     body: JSON.stringify(apiRequestBody)
   }).then((data) => {
     return data.json();
   }).then((data) => {
     console.log(data);
     setMessages([...chatMessages, {
       message: data.choices[0].message.content,
       sender: "ChatGPT"
     }]);
     setIsTyping(false);
   });
 }

  return (
    <div className="App">
      <div className="container">
      <div style={{ position:"relative", height: "500px", width: "98vw" }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
            >
              {messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />        
          </ChatContainer>
        </MainContainer>
      </div>
      </div>
    </div>
  )
}

export default App
