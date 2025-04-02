import { useRef, useState } from "react"
import { DropDownMenu } from "./DropDownMenu";
import { ClickEffect, ClickEffectRef } from "../00common/ClickEffect";
// import checkEffect from '../../public/animations/check.json';
import fireworkEffect from '../../public/animations/firework.json';

export const Header = () => {
    const effectRef = useRef<ClickEffectRef>(null);
    //state
  const [uiState, setUiState] = useState<{[key:string]: boolean}>({search:false, dropdown: false});
  const [inputState, setInputState] = useState<{[key:string]: string}>({search:''});
  const [msg, setMsg] = useState<{[key:string]: string}>({search:''});

  //handle state
  const handleStateChange = (state:string) => {
    setMsg({});
    setUiState(p=>state in p ? {...p, [state]: !p[state]}: p);
  }
  const handleInputChange = (name:string, value:string) => {
    if(name==='search' && value.length > 50) {
      hadleMsgChange(name, '검색은 50자를 넘을 수 없습니다.');
      return;
    }
    setInputState(p=>({...p, [name]: value}));
  }
  const hadleMsgChange = (name:string, value:string) => {
    setMsg(p=>({...p,[name]:value}));
  }
  const handleClickEffect = (e: React.MouseEvent) => {
    effectRef.current?.trigger(e.clientX, e.clientY);
  };

  //logic
  const search = (key:string) => {
    switch(key){
      case 'Enter':
        if(inputState.search.trim()==='') return;
        setMsg({});
        console.log(inputState.search);
        break;
    }
  }

  return (
    <div className='mt-10'>
      <header className='w-screen flex items-center gap-10 justify-between'>
        <section className='flex items-center pl-10 gap-5'>
          <img className='w-20' src='/public-chat-room-icon.png'/>
          <h1>전체 채팅방</h1>
        </section>
        <section className='pr-10 flex gap-5 items-center'>
          <div className="flex">
            <div className={`${uiState.search ? 'w-64':'w-0'} transition-all flex flex-col h-10`}>
              <input 
                name="search"
                className={`${uiState.search ? 'opacity-100 w-64':'opacity-0 w-0'} transition-all`} 
                placeholder="Enter로 검색"
                value={inputState.search}
                onKeyDown={e=>search(e.key)} 
                onChange={e=>handleInputChange(e.target.name, e.target.value)}
              />
              {msg.search&&<div className={`${uiState.search ? 'opacity-100 w-64':'opacity-0 w-0'} transition-all`}>{msg.search}</div>}
            </div>
            <img 
              className="cursor-pointer"
              src="/public_chat/search.svg"
              onClick={(e)=>{handleStateChange('search');handleClickEffect(e)}} 
            />
          </div>
          <div className="relative">
            <img 
                className="cursor-pointer"
                src="/public_chat/hamburger.svg"
                onClick={(e)=>{handleStateChange('dropdown');handleClickEffect(e)}}
            />
            <DropDownMenu visible={uiState.dropdown}/>
          </div>
        </section>
        <ClickEffect ref={effectRef} animationData={fireworkEffect} size={150}/>
      </header>
    </div>
  )
}