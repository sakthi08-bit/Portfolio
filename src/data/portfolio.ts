export interface ExperienceItem {
  id: string;
  num: string;
  role: string;
  organization: string;
  period: string;
  isCurrent?: boolean;
  meta: string;
  description?: string;
  bullets?: string[];
  tags: string[];
}

export interface ProjectItem {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  tags: string[];
  githubUrl: string;
  artType: 'network' | 'webvuln' | 'password' | 'wifi' | 'automation' | 'ctf';
}

export interface SkillCategory {
  num: string;
  name: string;
  items: string[];
}

export interface EditableProfileOverrides {
  instagramId: string;
  instagramCustomUrl: string;
  locationLabel: string;
  portraitUrl: string;
  educationNote: string;
}

export const DEFAULT_EDITABLE_PROFILE: EditableProfileOverrides = {
  instagramId: '_.sakthyyy._08._',
  instagramCustomUrl: '',
  locationLabel: 'India',
  portraitUrl: '',
  educationNote: 'Self-directed Computer Science, Cybersecurity & Embedded Systems',
};

/**
 * Validates whether a supplied Instagram display ID conforms to Instagram's
 * strict handle syntax:
 * - 1 to 30 characters
 * - Only letters, digits, periods (.), and underscores (_)
 * - Cannot begin or end with a period (.)
 * - Cannot contain consecutive periods (..)
 *
 * Never invents or modifies a username if the supplied ID is invalid.
 */
export function isValidInstagramHandle(rawId: string): boolean {
  const cleaned = rawId.trim().replace(/^@/, '');
  if (!cleaned || cleaned.length > 30) return false;
  if (cleaned.startsWith('.') || cleaned.endsWith('.')) return false;
  if (cleaned.includes('..')) return false;
  return /^[A-Za-z0-9._]+$/.test(cleaned);
}

export function resolveInstagramHref(rawId: string, customUrl?: string): string | null {
  const trimmedUrl = (customUrl || '').trim();
  if (trimmedUrl) {
    if (/^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._]+\/?$/i.test(trimmedUrl)) {
      return trimmedUrl;
    }
  }
  const cleaned = rawId.trim().replace(/^@/, '');
  if (!isValidInstagramHandle(cleaned)) {
    return null;
  }
  return `https://www.instagram.com/${encodeURIComponent(cleaned)}/`;
}

export const PORTFOLIO_DATA = {
  firstName: 'Sakthi',
  lastName: 'Kumaran',
  fullName: 'Sakthi Kumaran',
  identityLine: 'Coder | Developer | Cybersecurity Enthusiast',
  headline: 'Building ideas into digital experiences.',
  quote: 'Hack the world ethically, code your dreams.',
  loaderWords: ['Coding', 'Developing', 'Securing', 'Building'],
  rotatingRoles: [
    'Coder · Developer · Security Enthusiast',
    'Python, C/C++ & Bash Builder',
    'Penetration Testing Learner',
    'Exploring Network & Web Security',
    'Embedded Systems & Automation',
  ],
  marqueeItems: [
    { text: 'Software Development', italic: false },
    { text: 'Cybersecurity', italic: true },
    { text: 'Python & C/C++', italic: false },
    { text: 'Network Recon', italic: true },
    { text: 'Ethical Hacking', italic: false },
    { text: 'Embedded Systems', italic: true },
    { text: 'Workflow Automation', italic: false },
    { text: 'Digital Experiences', italic: true },
  ],
  contact: {
    email: 'sakthisd.tech@gmail.com',
    whatsappDisplay: '+91 9791226279',
    whatsappNumber: '919791226279',
    whatsappUrl: 'https://wa.me/919791226279',
    githubUrl: 'https://github.com/sakthi08-bit',
    githubHandle: 'sakthi08-bit',
  },
  about: {
    statementPrefix: 'I build software, automation scripts, and security tools where ',
    statementHighlight: 'clean engineering meets curiosity.',
    statementSuffix:
      ' From low-level systems code in C/C++ to web interfaces and network diagnostics in Python, I turn technical ideas into dependable digital experiences.',
    paragraphs: [
      {
        lead: "I'm Sakthi Kumaran — a Coder, Developer, and Cybersecurity Enthusiast",
        body: ' with a deep focus on understanding how modern software and networks operate under the hood — and how to engineer them to be faster, cleaner, and more resilient.',
      },
      {
        lead: 'Advancing in Cybersecurity & Embedded Systems,',
        body: ' I build hands-on utilities for network reconnaissance, web vulnerability auditing, and workflow automation inside controlled lab environments.',
      },
      {
        lead: 'My core toolkit spans Python, C, C++, Bash, and JavaScript.',
        body: ' Whether writing raw socket scanners, microcontroller firmware, or modern responsive interfaces, I enjoy working across every layer of the stack.',
      },
      {
        lead: 'Continuous hands-on practice',
        body: ' drives everything I build — sharpening offensive and defensive intuition through Capture The Flag challenges, Linux internals, and open-source experimentation.',
      },
    ],
    stats: [
      { count: 5, suffix: '+', label: 'Core programming languages' },
      { count: 10, suffix: '+', label: 'Security & dev tools in arsenal' },
      { count: 6, suffix: '', label: 'End-to-end technical builds' },
      { count: 24, suffix: '/7', label: 'Curiosity & lab exploration' },
    ],
  },
  experience: [
    {
      id: 'exp-cyber',
      num: '01',
      role: 'Cybersecurity Learner & CTF Practitioner',
      organization: 'Self-Directed · CTF & Security Labs',
      period: '2024 — Present',
      isCurrent: true,
      meta: 'Hands-on Research · TryHackMe, HackTheBox & Local Lab Environments',
      bullets: [
        'Practicing penetration testing methodologies, web application security analysis, and network forensics in isolated lab setups.',
        'Solving Capture The Flag challenges spanning cryptography, binary inspection, steganography, and HTTP vulnerability exploitation.',
        'Building custom Python and Bash reconnaissance scripts to understand protocol behavior from first principles.',
      ],
      tags: ['Penetration Testing', 'Network Security', 'Web App Security', 'CTF Challenges', 'Kali Linux'],
    },
    {
      id: 'exp-embedded',
      num: '02',
      role: 'Embedded Systems & C/C++ Learner',
      organization: 'Personal Projects & Open Source',
      period: '2023 — 2024',
      isCurrent: false,
      meta: 'Systems Programming · Hardware-Software Exploration',
      bullets: [
        'Developed low-level firmware in C and C++ for microcontrollers, focusing on deterministic execution and memory discipline.',
        'Explored hardware-software interfacing, UART serial communication protocols, and bare-metal register configuration.',
      ],
      tags: ['C', 'C++', 'Embedded Systems', 'UART', 'Microcontrollers', 'GDB'],
    },
    {
      id: 'exp-python',
      num: '03',
      role: 'Python, Web & Automation Developer',
      organization: 'Independent Builds & Open Source',
      period: '2022 — 2023',
      isCurrent: false,
      meta: 'Software Development · Scripting & Web Interfaces',
      bullets: [
        'Built modular Python automation scripts, CLI utilities, and socket-based networking tools for personal development and security workflows.',
        'Created clean web interfaces and API integrations using JavaScript, HTML/CSS, and Python scripting.',
      ],
      tags: ['Python', 'JavaScript', 'Bash', 'Task Automation', 'Sockets', 'Git'],
    },
  ] as ExperienceItem[],
  featuredProject: {
    kicker: 'Featured build',
    title: 'NetRecon Suite',
    subtitle: 'Python raw-socket network & service discovery engine.',
    description:
      'A fast, modular network reconnaissance utility engineered in Python using raw sockets. Identifies live hosts across subnets, probes open TCP ports concurrently, and fingerprints active service banners to map local lab topologies.',
    tags: ['Python', 'Raw Sockets', 'TCP/IP', 'Nmap Integration', 'CLI Tooling', 'Linux'],
    githubUrl: 'https://github.com/sakthi08-bit',
  },
  projects: [
    {
      id: 'proj-01',
      num: '01',
      title: 'Network Scanner',
      subtitle: 'Host & port reconnaissance',
      description:
        'Python-based network reconnaissance tool that identifies live hosts, open ports, and running services using raw sockets for speed and accuracy.',
      highlights: [
        'Concurrent TCP port probing with configurable timeout and thread-pool workers.',
        'Banner-grabbing inspection for common HTTP, SSH, and TLS endpoints.',
        'Clean terminal reporting designed for authorized local lab diagnostics.',
      ],
      tags: ['Python', 'Sockets', 'Nmap', 'Networking'],
      githubUrl: 'https://github.com/sakthi08-bit',
      artType: 'network',
    },
    {
      id: 'proj-02',
      num: '02',
      title: 'Web Vuln Scanner',
      subtitle: 'Automated HTTP security auditor',
      description:
        'Automated web application vulnerability scanner that checks lab targets for reflected XSS, SQL injection patterns, CSRF gaps, and misconfigured security headers.',
      highlights: [
        'Crawls internal links and form inputs using Requests and BeautifulSoup.',
        'Audits Content-Security-Policy, HSTS, X-Frame-Options, and cookie flags.',
        'Generates structured vulnerability summaries for remediation practice.',
      ],
      tags: ['Python', 'Requests', 'BeautifulSoup', 'Web Security'],
      githubUrl: 'https://github.com/sakthi08-bit',
      artType: 'webvuln',
    },
    {
      id: 'proj-03',
      num: '03',
      title: 'Password Auditor',
      subtitle: 'Hash & entropy verification tool',
      description:
        'Hash-verification and password strength auditing utility supporting MD5, SHA-1, and SHA-256 digests with dictionary, pattern, and entropy analysis.',
      highlights: [
        'Evaluates password bit-entropy and common character-substitution weaknesses.',
        'Supports MD5, SHA-1, and SHA-256 digest comparisons for educational auditing.',
        'Combines Python cryptographic primitives with fast Bash wordlist pipelines.',
      ],
      tags: ['Python', 'Cryptography', 'Bash', 'Hashlib'],
      githubUrl: 'https://github.com/sakthi08-bit',
      artType: 'password',
    },
    {
      id: 'proj-04',
      num: '04',
      title: 'WiFi Monitor Utility',
      subtitle: '802.11 lab frame analyzer',
      description:
        'Bash and Python utility for placing compatible wireless adapters into monitor mode, capturing lab handshakes, and inspecting 802.11 frame types.',
      highlights: [
        'Automates interface state switching and channel hopping in Linux test setups.',
        'Integrates cleanly with Aircrack-ng suite workflows for authorized wireless labs.',
        'Restores managed network state cleanly on exit.',
      ],
      tags: ['Bash', 'Python', 'Aircrack-ng', 'Linux'],
      githubUrl: 'https://github.com/sakthi08-bit',
      artType: 'wifi',
    },
  ] as ProjectItem[],
  additionalWork: [
    {
      id: 'add-01',
      num: '01',
      kicker: 'Automation · Bash & Python',
      title: 'Task Automation Framework',
      subtitle: 'Scheduled workflows & log triage',
      description:
        'Modular Bash and Python automation scripts for security and developer workflows — covering log parsing, alert triage, markdown report generation, and scheduled cron tasks.',
      tags: ['Bash', 'Python', 'Cron', 'Linux CLI'],
      githubUrl: 'https://github.com/sakthi08-bit',
      artType: 'automation' as const,
    },
    {
      id: 'add-02',
      num: '02',
      kicker: 'Security Research · Python & C',
      title: 'CTF Solver Toolkit',
      subtitle: 'Reverse engineering & crypto helpers',
      description:
        'Personal collection of reusable scripts and utilities developed while solving Capture The Flag challenges — steganography extractors, GDB helpers, and cipher decoders.',
      tags: ['Python', 'C', 'GDB', 'Cryptography'],
      githubUrl: 'https://github.com/sakthi08-bit',
      artType: 'ctf' as const,
    },
    {
      id: 'add-03',
      num: '03',
      kicker: 'Frontend & Motion · Web',
      title: 'Editorial Web Experiences',
      subtitle: 'Interactive interfaces & clean code',
      description:
        'Designing and developing responsive, high-craft digital experiences combining editorial typography, smooth scroll choreography, and accessible frontend architecture.',
      tags: ['TypeScript', 'JavaScript', 'HTML/CSS', 'GSAP'],
      githubUrl: 'https://github.com/sakthi08-bit',
      artType: 'network' as const,
    },
  ],
  skills: [
    {
      num: '01',
      name: 'Languages',
      items: ['Python', 'C', 'C++', 'Bash / Shell', 'JavaScript', 'TypeScript', 'HTML5 & CSS3'],
    },
    {
      num: '02',
      name: 'Cybersecurity Domains',
      items: [
        'Penetration Testing',
        'Network Security',
        'Web App Security',
        'Vulnerability Scanning',
        'Password & Hash Auditing',
        'CTF Problem Solving',
      ],
    },
    {
      num: '03',
      name: 'Security Arsenal',
      items: [
        'Kali Linux',
        'Nmap',
        'Wireshark',
        'Burp Suite',
        'Metasploit',
        'SQLMap',
        'John the Ripper',
        'Aircrack-ng',
      ],
    },
    {
      num: '04',
      name: 'Systems & Embedded',
      items: ['Embedded Systems', 'Microcontrollers', 'UART Communication', 'Bare-Metal C', 'GDB', 'Raw Sockets'],
    },
    {
      num: '05',
      name: 'Platforms & Workflow',
      items: [
        'Linux',
        'Docker',
        'Git & GitHub',
        'VirtualBox',
        'AWS Basics',
        'TryHackMe',
        'HackTheBox',
        'VPN / Proxychains',
      ],
    },
  ] as SkillCategory[],
  collaborationPillars: [
    {
      num: '01',
      title: 'Web & Digital Experiences',
      desc: 'Clean, responsive websites and interactive frontend interfaces built with modern standards.',
    },
    {
      num: '02',
      title: 'Python & CLI Tooling',
      desc: 'Custom automation scripts, data parsers, and command-line developer utilities.',
    },
    {
      num: '03',
      title: 'Security Labs & Research',
      desc: 'Collaborating on CTF write-ups, ethical security tooling, and defensive testing.',
    },
    {
      num: '04',
      title: 'Internships & Open Source',
      desc: 'Open to software engineering, cybersecurity internships, and open-source contributions.',
    },
  ],
};
