import React, { useState, useRef, useEffect } from 'react';
import fireworkEffect from '../../public/animations/firework.json';
import { ClickEffect, ClickEffectRef } from '../00common/ClickEffect';

interface LogEntry {
  content: string | string[];
  color?: string;
}

const fileSystem: Record<string, string[]> = {
  '/': ['home', 'bin', 'etc'],
  '/home': ['user', 'projects'],
  '/home/user': ['notes.txt', 'todo.md'],
  '/bin': ['ls', 'uname'],
  '/etc': ['config'],
};

export const TerminalPage = () => {
  const effectRef = useRef<ClickEffectRef>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [input, setInput] = useState('');
  const [booting, setBooting] = useState(false);
  const [booted, setBooted] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const bootAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      inputRef.current?.focus();
      effectRef.current?.trigger(e.clientX, e.clientY);
    };
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const bootLogs: LogEntry[] = [
    { content: 'Booting Linux Kernel 5.15.0...' },
    { content: 'Loading modules...' },
    { content: 'Initializing hardware...' },
    { content: 'Starting services...' },
    { content: 'System ready.' }
  ];

  const playBootEffect = () => {
    if (booting || booted) return;
    setBooting(true);
    appendBootLog(0);
  };

  const appendBootLog = (index: number) => {
    if (index < bootLogs.length) {
      setLogs((prev) => [...prev, bootLogs[index]]);
      setTimeout(() => appendBootLog(index + 1), 700);
    } else {
      setBooted(true);
      setBooting(false);
      if (bootAudioRef.current) {
        bootAudioRef.current.currentTime = 0;
        bootAudioRef.current.play();
      }
    }
  };

  const handleCommand = () => {
    const trimmed = input.trim();
    if (trimmed.length === 0) return;

    setLogs((prev) => [...prev, { content: `${currentPath} $ ${trimmed}` }]);

    if (trimmed === 'clear') {
      setLogs([]);
      setInput('');
      setHistory((prev) => [...prev, trimmed]);
      setHistoryIndex(-1);
      return;
    }

    if (trimmed.startsWith('cd')) {
      handleCdCommand(trimmed);
      setHistory((prev) => [...prev, trimmed]);
      setHistoryIndex(-1);
      setInput('');
      return;
    }

    const response = getCommandResponse(trimmed);
    setLogs((prev) => [...prev, ...response]);
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInput('');
  };

  const handleCdCommand = (cmd: string) => {
    const parts = cmd.split(' ');
    const target = parts[1];

    let newPath = currentPath;

    if (!target) {
      setLogs((prev) => [
        ...prev,
        { content: 'No directory specified', color: 'text-gray-400' }
      ]);
      return;
    }

    if (target === '..') {
      const segments = currentPath.split('/').filter(Boolean);
      segments.pop();
      newPath = '/' + segments.join('/');
      if (newPath === '') newPath = '/';
    } else if (target.startsWith('/')) {
      newPath = target;
    } else {
      newPath = currentPath === '/' ? `/${target}` : `${currentPath}/${target}`;
    }

    if (fileSystem[newPath]) {
      setCurrentPath(newPath);
    } else {
      setLogs((prev) => [
        ...prev,
        { content: `cd: no such file or directory: ${target}`, color: 'text-red-400' }
      ]);
    }
  };

  // === 명령어 목록 관리 ===
  const commandMap: Record<string, () => LogEntry[]> = {
    ls: () => {
      const files = fileSystem[currentPath];
      if (files) {
        return [{ content: files, color: 'text-blue-400' }];
      }
      return [{ content: 'No such directory', color: 'text-red-400' }];
    },
    'uname -r': () => [{ content: '5.15.0', color: 'text-yellow-400' }],
    whoami: () => [{ content: 'root', color: 'text-red-400' }],
    help: () => [{
      content: Object.keys(commandMap).join(' '),
      color: 'text-green-400'
    }]
  };

  const getCommandResponse = (cmd: string): LogEntry[] => {
    if (commandMap[cmd]) {
      return commandMap[cmd]();
    }
    return [{ content: 'command not found', color: 'text-gray-400' }];
  };

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setInput(history[newIndex]);
      setHistoryIndex(newIndex);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length === 0) return;
      const newIndex = historyIndex === -1 ? -1 : Math.min(history.length - 1, historyIndex + 1);
      if (newIndex === history.length - 1 || newIndex === -1) {
        setInput('');
        setHistoryIndex(-1);
      } else {
        setInput(history[newIndex]);
        setHistoryIndex(newIndex);
      }
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      setLogs((prev) => [...prev, { content: '^C', color: 'text-red-500' }]);
      setInput('');
    }
  };

  return (
    <div className="w-screen h-screen bg-black text-green-500 font-mono p-4 overflow-y-auto" onClick={(e) => { inputRef.current?.focus(); effectRef.current?.trigger(e.clientX, e.clientY); }}>
      <div className="w-full">
        {!booted && !booting && (
          <button
            className="border border-green-500 text-green-500 px-4 py-2 font-mono mb-4"
            onClick={playBootEffect}
          >
            BOOT
          </button>
        )}

        {logs.map((log, i) => (
          <div key={i} className={`${log.color || ''} blur-[0.7px] whitespace-pre-wrap`}>
            {Array.isArray(log.content)
              ? log.content.map((line, idx) => <div key={idx}>{line}</div>)
              : log.content}
          </div>
        ))}

        {booted && (
          <div className="flex items-center mt-2">
            <span>{currentPath} $</span>
            <input
              ref={inputRef}
              className="bg-black text-green-500 font-mono outline-none ml-2 caret-green-500 flex-1"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                playSound();
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <audio ref={audioRef} src="/sounds/keyboard.ogg" preload="auto" />
      <audio ref={bootAudioRef} src="/sounds/boot.wav" preload="auto" />
      <ClickEffect ref={effectRef} animationData={fireworkEffect} size={150} />
    </div>
  );
};

export default TerminalPage;
