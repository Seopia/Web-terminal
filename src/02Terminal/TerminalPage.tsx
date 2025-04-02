import React, { useState, useRef, useEffect } from 'react';

interface LogEntry {
  content: string | string[];
  color?: string;
}

export const TerminalPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [input, setInput] = useState('');
  const [booted, setBooted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const bootAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    const handleClick = () => {
      inputRef.current?.focus();
    };
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const playBootEffect = () => {
    const bootLogs = [
      { content: 'Booting Linux Kernel 5.15.0...' },
      { content: 'Loading modules...' },
      { content: 'Initializing hardware...' },
      { content: 'Starting services...' },
      { content: 'System ready.' }
    ];
    let i = 0;

    const interval = setInterval(() => {
      setLogs((prev) => [...prev, bootLogs[i]]);
      i++;
      if (i >= bootLogs.length) {
        clearInterval(interval);
        setBooted(true);
        if (bootAudioRef.current) {
          bootAudioRef.current.currentTime = 0;
          bootAudioRef.current.play();
        }
      }
    }, 700);
  };

  const handleCommand = () => {
    const trimmed = input.trim();
    if (trimmed.length === 0) return;
    setLogs((prev) => [
      ...prev,
      { content: `$ ${trimmed}` },
      ...fakeResponse(trimmed)
    ]);
    setInput('');
  };

  const fakeResponse = (cmd: string): LogEntry[] => {
    if (cmd === 'ls')
      return [{ content: ['kernel.c', 'main.o', 'boot.s'], color: 'text-blue-400' }];
    if (cmd === 'uname -r')
      return [{ content: '5.15.0', color: 'text-yellow-400' }];
    if (cmd === 'whoami')
      return [{ content: 'root', color: 'text-red-400' }];
    if (cmd === 'clear') {
      setLogs([]);
      return [];
    }
    return [{ content: 'command not found', color: 'text-gray-400' }];
  };

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  return (
    <div className="w-screen h-screen bg-black text-green-500 font-mono p-4 overflow-y-auto" onClick={() => inputRef.current?.focus()}>
      <div className="w-full">
        {!booted && (
          <button
            className="border border-green-500 text-green-500 px-4 py-2 font-mono mb-4"
            onClick={playBootEffect}
          >
            BOOT
          </button>
        )}

        {logs.map((log, i) => (
          <div key={i} className={`${log.color || ''} blur-[0.5px] whitespace-pre-wrap`}>
            {Array.isArray(log.content)
              ? log.content.map((line, idx) => <div key={idx}>{line}</div>)
              : log.content}
          </div>
        ))}

        {booted && (
          <div className="flex items-center flex-wrap mt-2">
            <span>$</span>
            <input
              ref={inputRef}
              className="bg-black text-green-500 font-mono outline-none ml-2 caret-green-500 flex-1"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                playSound();
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleCommand()}
            />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <audio ref={audioRef} src="/sounds/keyboard.ogg" preload="auto" />
      <audio ref={bootAudioRef} src="/sounds/boot.wav" preload="auto" />

      <style jsx>{`
        input {
          caret-shape: block;
          animation: blink 1s step-start infinite;
        }
        @keyframes blink {
          0%, 100% { caret-color: transparent; }
          50% { caret-color: #22c55e; }
        }
      `}</style>
    </div>
  );
};

export default TerminalPage;