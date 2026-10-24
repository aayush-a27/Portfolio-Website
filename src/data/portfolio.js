/*
 * Portfolio content — the single source of truth.
 *
 * Originally moved verbatim out of the pre-redesign components; updated
 * (Oct 2026) from the current resume (src/assets/AayushBhadulaResume.pdf)
 * and public GitHub repositories. Presentation lives in the components;
 * edit content here only.
 */
import {
  FaHtml5, FaCss3Alt, FaJs, FaReact, FaNodeJs, FaPython,
  FaGitAlt, FaGithub, FaRobot
} from 'react-icons/fa';
import {
  SiExpress, SiMongodb, SiRedis, SiTailwindcss, SiRedux,
  SiReactquery, SiFastapi, SiPostman, SiOpenai, SiPostgresql,
  SiSqlalchemy, SiAxios, SiJsonwebtokens, SiClaude, SiNvidia
} from 'react-icons/si';
import { TbVector, TbSql, TbBinaryTree, TbApi, TbArrowsExchange, TbBolt, TbHeartHandshake, TbRocket, TbBrackets } from 'react-icons/tb';
import { FiLinkedin, FiInstagram, FiGithub } from 'react-icons/fi';
import resumePdf from '../assets/AayushBhadulaResume.pdf';

/* ---------------------------------------------------------------- Navbar */

export const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  // Added with the redesign: links to the new 3D work gallery section.
  { label: '3D Work', href: '#work' },
  { label: 'Contact', href: '#contact' },
];

export const logo = { first: 'A', second: 'B', dot: '.' };

/* --------------------------------------------------------- LoadingScreen */

export const loading = {
  letter: 'A',
  letterAccent: 'B',
  text: 'Loading awesomeness...',
};

/* ------------------------------------------------------------------ Hero */

export const hero = {
  badge: 'Full Stack Developer 🚀',
  greeting: "Hi, I'm",
  firstName: 'Aayush',
  lastName: 'Bhadula',
  wave: '👋',
  // "Full Stack Developer crafting scalable, modern, and user-centric web experiences."
  subtitle: [
    { text: 'Full Stack Developer crafting ' },
    { text: 'scalable', highlight: 1 },
    { text: ', ' },
    { text: 'modern', highlight: 2 },
    { text: ', and ' },
    { text: 'user-centric', highlight: 3 },
    { text: ' web experiences.' },
  ],
  ctas: {
    projects: { label: 'View Projects', href: '#projects' },
    resume: { label: 'Resume', href: resumePdf, download: 'Aayush_Bhadula_Resume.pdf' },
    contact: { label: 'Contact Me', href: '#contact' },
  },
  scroll: { label: 'Scroll Down', href: '#about' },
};

/* ----------------------------------------------------------------- About */

export const about = {
  title: { lead: 'About', accent: 'Me' },
  // Resume summary
  bio: [
    { text: 'Computer Science graduate (B.Tech, 2025)', strong: true },
    {
      text:
        ' with hands-on experience building and debugging full-stack web applications through an internship and a live freelance project. Comfortable with JavaScript, Python, REST APIs, SQL and NoSQL databases, and Git. Enjoy tracing bugs to their root cause and picking up new tools quickly.',
    },
  ],
  factsTitle: 'Quick Facts ⚡',
  educationTitle: 'Education',
};

export const education = [
  {
    title: 'B.Tech, Computer Science',
    place: 'Dr. A.P.J. Abdul Kalam Technical University, Lucknow',
    period: '2021 – 2025',
  },
  {
    title: 'Class XII – 74%',
    place: 'Sarvodaya Bal Vidyalaya, Delhi',
    period: '2020 – 2021',
  },
];

export const aboutItems = [
  {
    icon: '💻',
    title: 'Full Stack Developer',
    desc: 'Passionate about building end-to-end web applications with modern frameworks and clean architecture.',
    color: 'var(--color-cyan)',
  },
  {
    icon: '🎓',
    title: 'B.Tech Graduate',
    desc: 'B.Tech in Computer Science (2021 – 2025) from Dr. A.P.J. Abdul Kalam Technical University, Lucknow.',
    color: 'var(--color-yellow)',
  },
  {
    icon: '🚀',
    title: 'Production-Ready Builder',
    desc: 'Enthusiastic about building production-ready applications, learning new technologies, and creating engaging user experiences.',
    color: 'var(--color-pink)',
  },
  {
    icon: '🤖',
    title: 'Innovation Explorer',
    desc: 'Loves solving problems, building innovative products, and exploring AI-powered applications.',
    color: 'var(--color-purple)',
  },
];

export const factCards = [
  { emoji: '🚀', text: 'Full Stack MERN Developer', bg: 'var(--color-cyan)' },
  { emoji: '🎓', text: 'B.Tech Graduated', bg: 'var(--color-yellow)' },
  { emoji: '💡', text: 'Always Learning New Technologies', bg: 'var(--color-pink)' },
  { emoji: '🤖', text: 'Interested in AI Applications', bg: 'var(--color-orange)' },
];

/* ---------------------------------------------------------------- Skills */

export const skillsTitle = { lead: 'My', accent: 'Skills' };

export const skillCategories = [
  {
    title: 'Languages',
    color: 'var(--color-purple)',
    skills: [
      { name: 'JavaScript', icon: FaJs, color: '#F7DF1E' },
      { name: 'Python', icon: FaPython, color: '#3776AB' },
      { name: 'SQL (basic)', icon: TbSql, color: '#4479A1' },
    ],
  },
  {
    title: 'Frontend',
    color: 'var(--color-cyan)',
    skills: [
      { name: 'HTML', icon: FaHtml5, color: '#E34F26' },
      { name: 'CSS', icon: FaCss3Alt, color: '#1572B6' },
      { name: 'React.js', icon: FaReact, color: '#61DAFB' },
      { name: 'Tailwind CSS', icon: SiTailwindcss, color: '#06B6D4' },
      { name: 'Redux Toolkit', icon: SiRedux, color: '#764ABC' },
      { name: 'React Query', icon: SiReactquery, color: '#FF4154' },
    ],
  },
  {
    title: 'Backend',
    color: 'var(--color-pink)',
    skills: [
      { name: 'Node.js', icon: FaNodeJs, color: '#339933' },
      { name: 'Express.js', icon: SiExpress, color: '#888888' },
      { name: 'FastAPI', icon: SiFastapi, color: '#009688' },
      { name: 'REST APIs', icon: TbApi, color: '#FF8A3D' },
      { name: 'JWT Authentication', icon: SiJsonwebtokens, color: '#D63AFF' },
    ],
  },
  {
    title: 'Databases',
    color: 'var(--color-yellow)',
    skills: [
      { name: 'PostgreSQL', icon: SiPostgresql, color: '#4169E1' },
      { name: 'MongoDB', icon: SiMongodb, color: '#47A248' },
      { name: 'Redis', icon: SiRedis, color: '#DC382D' },
      { name: 'pgvector', icon: TbVector, color: '#336791' },
    ],
  },
  {
    title: 'Tools',
    color: 'var(--color-orange)',
    skills: [
      { name: 'Git', icon: FaGitAlt, color: '#F05032' },
      { name: 'GitHub', icon: FaGithub, color: '#aaa' },
      { name: 'Postman', icon: SiPostman, color: '#FF6C37' },
      { name: 'SQLAlchemy', icon: SiSqlalchemy, color: '#D71F00' },
      { name: 'Alembic', icon: TbArrowsExchange, color: '#6BA81E' },
      { name: 'Axios', icon: SiAxios, color: '#5A29E4' },
    ],
  },
  {
    title: 'AI Tools',
    color: 'var(--color-magenta)',
    skills: [
      { name: 'Cursor', icon: TbBrackets, color: '#00D4AA' },
      { name: 'Antigravity', icon: FaRobot, color: '#A855F7' },
      { name: 'Claude Code', icon: SiClaude, color: '#D97757' },
      { name: 'OpenAI Codex', icon: SiOpenai, color: '#10A37F' },
      { name: 'Nemotron', icon: SiNvidia, color: '#76B900' },
      { name: 'Groq', icon: TbBolt, color: '#F55036' },
      { name: 'Lovable', icon: TbHeartHandshake, color: '#FF5C8A' },
      { name: 'Rocket', icon: TbRocket, color: '#FF8A3D' },
    ],
  },
];

export const fundamentals = {
  title: 'Fundamentals',
  icon: TbBinaryTree,
  text: 'Object-oriented programming basics; arrays, searching and sorting algorithms',
};

/* ------------------------------------------------------------ Experience */

export const experienceTitle = { lead: 'My', accent: 'Experience' };

// Newest first
export const experiences = [
  {
    company: 'Sara Creation Decor',
    role: 'Freelance Full Stack Developer',
    location: 'Delhi, India',
    duration: 'Sep 2026 – Present',
    current: true,
    responsibilities: [
      'Building and maintaining a live e-commerce website for a handcrafted home decor business using React.js, Node.js, Express.js, MongoDB and Tailwind CSS.',
      'Developed customer and admin features for product catalog, inventory, orders, checkout and login, using REST APIs with JWT-based access control.',
      'Integrated Razorpay for payments, Shiprocket for shipping, Cloudinary for images and Resend/Brevo for transactional emails.',
      'Deployed and maintain the site on Vercel, Render and MongoDB Atlas with a custom domain; work on page speed, image loading and basic SEO.',
    ],
  },
  {
    company: 'AventIQ',
    companyDetail: 'Mittal Software Labs Limited',
    role: 'Full Stack Intern',
    location: 'Delhi, India',
    duration: 'Dec 2025 – May 2026',
    responsibilities: [
      'Built reusable React components and connected them to REST APIs for logistics modules.',
      'Wrote backend APIs in Node.js and Express.js for inventory and pricing workflows.',
      'Debugged and fixed production bugs, and improved performance by optimizing API responses.',
    ],
  },
];

export const experienceLabels = { responsibilities: 'Key Responsibilities', current: 'Current' };

/* -------------------------------------------------------------- Projects */

export const projectsTitle = { lead: 'My', accent: 'Projects' };

export const projectLabels = {
  featured: 'FEATURED!',
  features: '✨ Key Features',
  techStack: '🛠️ Tech Stack',
  liveDemo: 'Live Demo',
  github: 'GitHub',
  more: 'More on GitHub',
};

/*
 * Featured projects: the resume's projects plus AI Resume Builder (kept
 * unchanged from the previous portfolio). Optional `preview` (an imported
 * image URL) enables the liquid WebGL preview for that project.
 */
export const projects = [
  {
    title: 'Green Book AI',
    category: 'AI · Full Stack Web Application',
    status: 'In Progress',
    description:
      'Building a document assistant where users upload PDFs and ask questions about them, using Retrieval-Augmented Generation (RAG).',
    features: [
      'Async backend in Python with FastAPI and SQLAlchemy; PostgreSQL with pgvector stores embeddings for semantic search; Alembic for schema migrations.',
      'Implemented JWT login with bcrypt password hashing and Redis caching; supports both Gemini and Groq models.',
    ],
    techStack: {
      Frontend: ['React'],
      Backend: ['FastAPI', 'SQLAlchemy', 'Alembic'],
      Data: ['PostgreSQL', 'pgvector', 'Redis'],
      AI: ['Gemini', 'Groq'],
    },
    liveDemo: 'https://greenbookai.pages.dev',
    github: 'https://github.com/aayush-a27/FullstackLearning--React-and-FastApi',
  },
  {
    title: 'We Three Food Stuff Trading Platform',
    category: 'Full Stack Web Application',
    description:
      'Built a B2B commodity trading and logistics platform covering freight pricing, ports and incoterms.',
    features: [
      'Designed and implemented 15+ REST APIs for supply-chain modules and 20+ reusable React components for admin dashboards.',
      'Added bulk CSV/Excel import using Node.js streams, Papaparse and ExcelJS to handle large data files.',
      'Used Redis caching and React Query to speed up data loading; secured APIs with JWT and role-based access control.',
    ],
    techStack: {
      Frontend: ['React.js', 'Redux Toolkit', 'React Query'],
      Backend: ['Node.js', 'Express.js', 'MongoDB', 'Redis'],
    },
  },
  {
    title: 'AI Resume Builder',
    category: 'Full Stack Web Application',
    description:
      'AI Resume Builder is a modern full-stack web application that enables users to create professional and ATS-friendly resumes with ease. Users can manage personal information, education, experience, skills, and projects through an intuitive interface while previewing changes in real time.',
    features: [
      'AI-powered professional summary generation using Google Gemini',
      'Create and manage multiple resume sections',
      'Real-time resume preview',
      'Multiple professional resume templates',
      'Export resumes as ATS-friendly PDFs',
      'Dark and Light theme support',
      'Responsive design across all devices',
      'Local storage support',
    ],
    techStack: {
      Frontend: ['React', 'Vite', 'Tailwind CSS', 'Context API', 'React Hook Form'],
      Backend: ['Node.js', 'Express.js', 'MongoDB'],
      AI: ['Google Gemini API'],
      Deployment: ['Vercel'],
    },
    liveDemo: 'https://ai-resume-builder-sigma-one.vercel.app',
    github: 'https://github.com/aayush-a27/AI-Resume-Builder',
  },
  {
    title: 'Movie Ticket Booking App',
    category: 'Full Stack Web Application',
    description: 'Built a ticket booking app with movie browsing, theater discovery and seat booking.',
    features: [
      'Used geolocation to show nearby theaters and show timings.',
      'Added seat selection with availability checks, and integrated PayPal for payments.',
    ],
    techStack: {
      Stack: ['MERN Stack'],
      Payments: ['PayPal API'],
    },
    github: 'https://github.com/aayush-a27/E-ticketing',
  },
];

/* More projects, summarised from their GitHub READMEs. */
export const moreProjects = [
  {
    title: 'WeatherGuard Admin',
    description:
      'Invite-only weather alert service: an admin dashboard approves users, who then receive scheduled, city-specific weather alerts on Telegram.',
    tags: ['React', 'NestJS', 'OAuth', 'Telegram Bot', 'OpenWeatherMap'],
    // liveDemo: 'https://weather-guard-admin.vercel.app',
    github: 'https://github.com/aayush-a27/WeatherGuard-Admin',
  },
  {
    title: 'LINKEE Chat App',
    description:
      'Real-time social chat app with group chats, voice and video calling, friend requests, a post feed and notifications.',
    tags: ['React', 'Node.js', 'MongoDB', 'Stream Chat', 'Socket.io'],
    // liveDemo: 'https://linkee-chat-app-with-video-calling.vercel.app',
    github: 'https://github.com/aayush-a27/LINKEE-ChatApp-With-Video-Calling-Feature-',
  },
  {
    title: 'TinyLink',
    description:
      'URL shortener with custom codes, click tracking and per-link statistics in a link management dashboard.',
    tags: ['React', 'Express.js', 'MongoDB', 'Tailwind CSS'],
    // liveDemo: 'https://tiny-link-web-app.vercel.app',
    github: 'https://github.com/aayush-a27/TinyLink_web_app',
  },
  {
    title: 'Broker Diary',
    description:
      'Offline Android CRM for real estate brokers: leads, properties, site visits, follow-ups, deals and on-time reminders, with all data kept on the phone.',
    tags: ['Flutter', 'Dart', 'Android'],
    github: 'https://github.com/aayush-a27/BrokerHelper-App',
  },
  {
    title: 'Blender AI Agent',
    description:
      'Blender add-on that turns natural-language commands into 3D modelling operations using NVIDIA Nemotron, with validated JSON responses instead of arbitrary code.',
    tags: ['Python', 'Blender', 'Nemotron'],
    github: 'https://github.com/aayush-a27/blender-ai-agent',
  },
];

/* --------------------------------------------------------------- Contact */

export const contact = {
  title: { lead: 'Get In', accent: 'Touch' },
  heading: "Let's Work Together! 🤝",
  description:
    "Have a project in mind, a question, or just want to say hi? Feel free to reach out. I'd love to hear from you!",
  email: 'aayushbhadula567@gmail.com',
  phone: '+91 8368090659',
  location: 'Uttar Pradesh, India',
  socialTitle: 'Find Me On',
};

export const socialLinks = [
  {
    icon: FiLinkedin,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/aayush-bhadula-a78a67298/',
    color: 'var(--color-blue)',
    shape: 'circle',
  },
  {
    icon: FiGithub,
    label: 'GitHub',
    href: 'https://github.com/aayush-a27',
    color: 'var(--color-purple)',
    shape: 'circle',
  },
  {
    icon: FiInstagram,
    label: 'Instagram',
    href: 'https://www.instagram.com/aayush_bhadula/',
    color: 'var(--color-pink)',
    shape: 'square',
  },
];

/* ---------------------------------------------------------------- Footer */

export const footer = {
  quote: ['Code.', 'Create.', 'Innovate.'],
  name: 'Aayush Bhadula',
  madeWith: 'Made with',
  andLotsOf: 'and lots of ☕',
};
