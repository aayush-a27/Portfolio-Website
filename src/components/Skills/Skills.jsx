import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  FaHtml5, FaCss3Alt, FaJs, FaReact, FaNodeJs, FaPython,
  FaGitAlt, FaGithub, FaVuejs, FaRobot, FaBrain, FaMicrochip
} from 'react-icons/fa';
import {
  SiExpress, SiMongodb, SiRedis, SiTailwindcss, SiRedux,
  SiReactquery, SiFastapi, SiVercel, SiVite, SiPostman,
  SiOpenai
} from 'react-icons/si';
import { TbBrain, TbRocket } from 'react-icons/tb';
import './Skills.css';

const skillCategories = [
  {
    title: 'Frontend',
    color: 'var(--color-cyan)',
    skills: [
      { name: 'HTML', icon: FaHtml5, color: '#E34F26' },
      { name: 'CSS', icon: FaCss3Alt, color: '#1572B6' },
      { name: 'JavaScript', icon: FaJs, color: '#F7DF1E' },
      { name: 'React.js', icon: FaReact, color: '#61DAFB' },
      { name: 'Redux', icon: SiRedux, color: '#764ABC' },
      { name: 'React Query', icon: SiReactquery, color: '#FF4154' },
      { name: 'Tailwind CSS', icon: SiTailwindcss, color: '#06B6D4' },
      { name: 'Vue.js', icon: FaVuejs, color: '#4FC08D' },
    ],
  },
  {
    title: 'Backend',
    color: 'var(--color-pink)',
    skills: [
      { name: 'Node.js', icon: FaNodeJs, color: '#339933' },
      { name: 'Express.js', icon: SiExpress, color: '#888888' },
      { name: 'FastAPI', icon: SiFastapi, color: '#009688' },
    ],
  },
  {
    title: 'Database',
    color: 'var(--color-yellow)',
    skills: [
      { name: 'MongoDB', icon: SiMongodb, color: '#47A248' },
      { name: 'Redis', icon: SiRedis, color: '#DC382D' },
    ],
  },
  {
    title: 'Languages',
    color: 'var(--color-purple)',
    skills: [
      { name: 'JavaScript', icon: FaJs, color: '#F7DF1E' },
      { name: 'Python', icon: FaPython, color: '#3776AB' },
    ],
  },
  {
    title: 'Tools',
    color: 'var(--color-orange)',
    skills: [
      { name: 'Git', icon: FaGitAlt, color: '#F05032' },
      { name: 'GitHub', icon: FaGithub, color: '#aaa' },
      { name: 'Vercel', icon: SiVercel, color: '#aaa' },
      { name: 'Postman', icon: SiPostman, color: '#FF6C37' },
      { name: 'MongoDB Compass', icon: SiMongodb, color: '#47A248' },
    ],
  },
  {
    title: 'AI Tools',
    color: 'var(--color-magenta)',
    skills: [
      { name: 'Antigravity', icon: FaRobot, color: '#A855F7' },
      { name: 'Cursor', icon: FaMicrochip, color: '#00D4AA' },
      { name: 'Claude Opus', icon: FaBrain, color: '#D4A574' },
      { name: 'Claude Sonnet', icon: FaBrain, color: '#D4A574' },
      { name: 'Codex OpenAI', icon: SiOpenai, color: '#10A37F' },
      { name: 'DeepSeek', icon: TbBrain, color: '#4D6BFE' },
    ],
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
};

const Skills = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="skills" className="skills section">
      <div className="halftone-overlay" />

      {/* Decorative background shapes */}
      <div className="skills-bg-shapes" aria-hidden="true">
        <div className="skills-dots-pattern" />
        <div className="skills-zigzag" />
      </div>

      <div className="container" ref={ref}>
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">
            My <span style={{ color: 'var(--color-yellow)' }}>Skills</span>
          </h2>
        </motion.div>

        <div className="skills-categories">
          {skillCategories.map((category, catIndex) => (
            <motion.div
              key={category.title}
              className="skill-category"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: catIndex * 0.15, duration: 0.5 }}
            >
              <div className="skill-category-header">
                <div
                  className="skill-category-dot"
                  style={{ background: category.color }}
                />
                <h3 className="skill-category-title">{category.title}</h3>
              </div>

              <motion.div
                className="skill-badges"
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
              >
                {category.skills.map((skill) => {
                  const Icon = skill.icon;
                  return (
                    <motion.div
                      key={skill.name}
                      className="skill-badge"
                      variants={badgeVariants}
                      whileHover={{
                        scale: 1.12,
                        rotate: Math.random() > 0.5 ? 5 : -5,
                        y: -5,
                      }}
                    >
                      <Icon
                        className="skill-badge-icon"
                        style={{ color: skill.color }}
                      />
                      <span className="skill-badge-name">{skill.name}</span>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
