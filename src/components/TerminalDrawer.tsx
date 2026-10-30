import React, { useEffect, useRef, useState } from 'react';
import { EditableProfileOverrides, PORTFOLIO_DATA, resolveInstagramHref } from '../data/portfolio';

interface TerminalLine {
  id: number;
  text: string;
  tone?: 'acc' | 'cmd' | 'err';
}

interface TerminalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCustomizer: () => void;
  profile: EditableProfileOverrides;
}

export function TerminalDrawer({
  isOpen,
  onClose,
  onOpenCustomizer,
  profile,
}: TerminalDrawerProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 1, text: 'Type "help" to see available commands.' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const outRef = useRef<HTMLDivElement | null>(null);
  const nextId = useRef<number>(2);

  useEffect(() => {
    if (isOpen) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    } else {
      inputRef.current?.blur();
    }
  }, [isOpen]);

  useEffect(() => {
    if (outRef.current) {
      outRef.current.scrollTop = outRef.current.scrollHeight;
    }
  }, [lines]);

  const appendLines = (items: Array<{ text: string; tone?: 'acc' | 'cmd' | 'err' }>) => {
    setLines((prev) => [
      ...prev,
      ...items.map((item) => ({
        id: nextId.current++,
        text: item.text,
        tone: item.tone,
      })),
    ]);
  };

  const runCommand = (raw: string) => {
    const cmd = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!cmd) return;

    setHistory((prev) => {
      const next = [...prev, raw];
      setHistIndex(next.length);
      return next;
    });

    if (cmd === 'clear') {
      setLines([]);
      return;
    }
    if (cmd === 'exit') {
      onClose();
      return;
    }
    if (cmd === 'edit' || cmd === 'customize') {
      appendLines([
        { text: `~ $ ${raw}`, tone: 'cmd' },
        { text: '  Opening profile & contact customizer...', tone: 'acc' },
      ]);
      onOpenCustomizer();
      return;
    }

    const igHref = resolveInstagramHref(profile.instagramId, profile.instagramCustomUrl);

    const commandMap: Record<string, Array<{ text: string; tone?: 'acc' | 'cmd' | 'err' }>> = {
      help: [
        { text: '  Available commands:', tone: 'acc' },
        { text: '  whoami       who is Sakthi Kumaran?' },
        { text: '  projects     selected engineering & security builds' },
        { text: '  skills       languages, tools & security domains' },
        { text: '  experience   learning & development journey' },
        { text: '  contact      direct email & WhatsApp details' },
        { text: '  socials      GitHub & social handles' },
        { text: '  edit         customize editable profile details' },
        { text: '  clear        clear terminal output' },
        { text: '  exit         close terminal' },
      ],
      whoami: [
        { text: `  ${PORTFOLIO_DATA.fullName}`, tone: 'acc' },
        { text: `  ${PORTFOLIO_DATA.identityLine}` },
        { text: `  "${PORTFOLIO_DATA.headline}"` },
        { text: `  Location: ${profile.locationLabel}` },
      ],
      projects: [
        { text: '  Selected builds:', tone: 'acc' },
        { text: '  01  Network Scanner        Python · Raw Sockets · Nmap' },
        { text: '  02  Web Vuln Scanner       Python · Requests · BeautifulSoup' },
        { text: '  03  Password Auditor       Python · Cryptography · Bash' },
        { text: '  04  WiFi Monitor Utility   Bash · Python · Aircrack-ng' },
        { text: '  05  Task Automation        Bash · Python · Cron' },
        { text: '  06  CTF Solver Toolkit     Python · C · GDB' },
      ],
      skills: [
        { text: '  Core arsenal:', tone: 'acc' },
        { text: '  Languages    Python, C, C++, Bash/Shell, JavaScript' },
        { text: '  Security     Penetration Testing, Network & Web Security' },
        { text: '  Tools        Kali Linux, Wireshark, Nmap, Burp Suite, Metasploit' },
        { text: '  Platforms    Linux, Docker, Git, VirtualBox, TryHackMe, HackTheBox' },
      ],
      experience: [
        { text: '  Learning & building:', tone: 'acc' },
        { text: '  2024–Now    Cybersecurity Learner & CTF Practitioner' },
        { text: '  2023–2024   Embedded Systems & C/C++ Learner' },
        { text: '  2022–2023   Python, Web & Automation Developer' },
      ],
      contact: [
        { text: '  Direct channels:', tone: 'acc' },
        { text: `  Email       ${PORTFOLIO_DATA.contact.email}` },
        { text: `  WhatsApp    ${PORTFOLIO_DATA.contact.whatsappDisplay} (${PORTFOLIO_DATA.contact.whatsappUrl})` },
      ],
      socials: [
        { text: '  Online presence:', tone: 'acc' },
        { text: `  GitHub      ${PORTFOLIO_DATA.contact.githubUrl}` },
        { text: `  WhatsApp    ${PORTFOLIO_DATA.contact.whatsappUrl}` },
        {
          text: `  Instagram   ${profile.instagramId}${igHref ? ` (${igHref})` : ' (display ID)'}`,
        },
      ],
    };

    const output = commandMap[cmd];
    if (output) {
      appendLines([{ text: `~ $ ${raw}`, tone: 'cmd' }, ...output]);
    } else {
      appendLines([
        { text: `~ $ ${raw}`, tone: 'cmd' },
        { text: `  command not found: ${raw} — try "help"`, tone: 'err' },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      const idx = Math.max(0, histIndex - 1);
      setHistIndex(idx);
      setInput(history[idx] || '');
      return;
    }
    if (e.key === 'ArrowDown' && history.length) {
      e.preventDefault();
      const idx = Math.min(history.length, histIndex + 1);
      setHistIndex(idx);
      setInput(history[idx] || '');
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const current = input;
      setInput('');
      runCommand(current);
    }
  };

  return (
    <div
      className={`term ${isOpen ? 'is-open' : ''}`}
      id="term"
      role="dialog"
      aria-label="Interactive Terminal"
      aria-hidden={!isOpen}
    >
      <div className="term__bar">
        <span className="mono">sakthi@portfolio: ~</span>
        <button className="term__close mono" onClick={onClose} aria-label="Close terminal">
          esc
        </button>
      </div>
      <div className="term__out" ref={outRef} data-lenis-prevent="">
        {lines.map((l) => (
          <div
            key={l.id}
            className={`term__line ${l.tone ? `term__${l.tone}` : ''}`}
          >
            {l.text}
          </div>
        ))}
      </div>
      <label className="term__input">
        <span className="term__prompt">~ $</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
          aria-label="Terminal command"
        />
      </label>
    </div>
  );
}
