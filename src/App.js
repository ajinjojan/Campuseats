import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Utensils, ShoppingBag, CreditCard,
  CheckCircle, User, LogOut,
  Coffee, Clock, Search, Plus, Minus,
  ChefHat, Trash2, ArrowRight, QrCode,
  Edit, PlusCircle, X, Palette, Sun, Moon, TreePine, Sunrise, Waves, CloudSun
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  getDoc
} from "firebase/firestore";


import DarkVeil, { THEMES } from "./components/DarkVeil";
import GlareHover from "./components/GlareHover";

// Theme icons mapping
const THEME_ICONS = {
  default: Palette,
  forest: TreePine,
  sunshine: Sun,
  morning: Sunrise,
  ocean: Waves,
  sunset: CloudSun,
  night: Moon
};

/* ================= FIREBASE CONFIGURATION ================= */

const firebaseConfig = {
  apiKey: "AIzaSyAQyI71N5SbqrRMkgCqzraK6yFfx1HtDP4",
  authDomain: "campuseats2-168fd.firebaseapp.com",
  projectId: "campuseats2-168fd",
  storageBucket: "campuseats2-168fd.firebasestorage.app",
  messagingSenderId: "1018340912497",
  appId: "1:1018340912497:web:32c52a41141ca5b54bdad0",
  measurementId: "G-MF9B673PRZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// App Constants
const APP_ID = "campuseats-live-v1";
const MASTER_KEY = "master123";

/* ================= MOCK DATA & UTILS ================= */

const INITIAL_MENU = [
  { id: 1, name: "Chicken Biryani", price: 120, category: "Lunch", desc: "Spicy aromatic rice with tender chicken", image: "🍗", color: "bg-orange-100 text-orange-600" },
  { id: 2, name: "Veg Thali", price: 80, category: "Lunch", desc: "Rice, dal, 2 curries, curd & pickle", image: "🥗", color: "bg-green-100 text-green-600" },
  { id: 3, name: "Spicy Chicken Roll", price: 60, category: "Snacks", desc: "Grilled chicken wrapped in paratha", image: "🌯", color: "bg-red-100 text-red-600" },
  { id: 4, name: "Egg Puffs", price: 20, category: "Snacks", desc: "Crispy pastry with boiled egg", image: "🥚", color: "bg-yellow-100 text-yellow-600" },
  { id: 5, name: "Fresh Lime Soda", price: 25, category: "Drinks", desc: "Refreshing sweet & salty lime", image: "🍋", color: "bg-lime-100 text-lime-600" },
  { id: 6, name: "Masala Chai", price: 10, category: "Drinks", desc: "Hot spiced tea", image: "☕", color: "bg-amber-100 text-amber-600" },
];

const generateOrderId = () => `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

const formatCurrency = (amount) => `₹${amount}`;

// Theme-based color mapping for cards
const getThemeCardColors = (theme) => {
  const themeColors = {
    default: {
      bg: 'bg-white/70',
      border: 'border-white/20',
      text: 'text-slate-800',
      textSecondary: 'text-slate-500',
      accent: 'bg-indigo-500/20'
    },
    forest: {
      bg: 'bg-green-50/80',
      border: 'border-green-200/30',
      text: 'text-green-900',
      textSecondary: 'text-green-700',
      accent: 'bg-green-500/20'
    },
    sunshine: {
      bg: 'bg-yellow-50/80',
      border: 'border-yellow-200/30',
      text: 'text-yellow-900',
      textSecondary: 'text-yellow-700',
      accent: 'bg-yellow-500/20'
    },
    morning: {
      bg: 'bg-blue-50/80',
      border: 'border-blue-200/30',
      text: 'text-blue-900',
      textSecondary: 'text-blue-700',
      accent: 'bg-blue-500/20'
    },
    ocean: {
      bg: 'bg-cyan-50/80',
      border: 'border-cyan-200/30',
      text: 'text-cyan-900',
      textSecondary: 'text-cyan-700',
      accent: 'bg-cyan-500/20'
    },
    sunset: {
      bg: 'bg-orange-50/80',
      border: 'border-orange-200/30',
      text: 'text-orange-900',
      textSecondary: 'text-orange-700',
      accent: 'bg-orange-500/20'
    },
    night: {
      bg: 'bg-slate-800/70',
      border: 'border-slate-600/30',
      text: 'text-slate-100',
      textSecondary: 'text-slate-300',
      accent: 'bg-slate-500/20'
    }
  };
  return themeColors[theme] || themeColors.default;
};

// Theme-based color mapping for header and navbar
const getThemeNavColors = (theme) => {
  const themeNavColors = {
    default: {
      headerText: 'text-slate-800',
      headerSecondary: 'text-slate-700',
      navActive: 'text-indigo-600',
      navActiveBg: 'bg-indigo-500/20',
      navInactive: 'text-slate-500',
      navHover: 'hover:text-slate-700',
      border: 'border-white/30'
    },
    forest: {
      headerText: 'text-green-900',
      headerSecondary: 'text-green-700',
      navActive: 'text-green-700',
      navActiveBg: 'bg-green-500/20',
      navInactive: 'text-green-600',
      navHover: 'hover:text-green-800',
      border: 'border-green-200/30'
    },
    sunshine: {
      headerText: 'text-yellow-900',
      headerSecondary: 'text-yellow-700',
      navActive: 'text-yellow-700',
      navActiveBg: 'bg-yellow-500/20',
      navInactive: 'text-yellow-600',
      navHover: 'hover:text-yellow-800',
      border: 'border-yellow-200/30'
    },
    morning: {
      headerText: 'text-blue-900',
      headerSecondary: 'text-blue-700',
      navActive: 'text-blue-700',
      navActiveBg: 'bg-blue-500/20',
      navInactive: 'text-blue-600',
      navHover: 'hover:text-blue-800',
      border: 'border-blue-200/30'
    },
    ocean: {
      headerText: 'text-cyan-900',
      headerSecondary: 'text-cyan-700',
      navActive: 'text-cyan-700',
      navActiveBg: 'bg-cyan-500/20',
      navInactive: 'text-cyan-600',
      navHover: 'hover:text-cyan-800',
      border: 'border-cyan-200/30'
    },
    sunset: {
      headerText: 'text-orange-900',
      headerSecondary: 'text-orange-700',
      navActive: 'text-orange-700',
      navActiveBg: 'bg-orange-500/20',
      navInactive: 'text-orange-600',
      navHover: 'hover:text-orange-800',
      border: 'border-orange-200/30'
    },
    night: {
      headerText: 'text-slate-100',
      headerSecondary: 'text-slate-300',
      navActive: 'text-slate-200',
      navActiveBg: 'bg-slate-500/20',
      navInactive: 'text-slate-400',
      navHover: 'hover:text-slate-200',
      border: 'border-slate-600/30'
    }
  };
  return themeNavColors[theme] || themeNavColors.default;
};

/* ================= GRADUAL BLUR COMPONENT ================= */

const DEFAULT_GRADUAL_BLUR_CONFIG = {
  position: 'bottom',
  strength: 2,
  height: '1.5rem',
  divCount: 5,
  exponential: true,
  zIndex: 1000,
  animated: true,
  duration: '0.3s',
  easing: 'ease-out',
  opacity: 1,
  curve: 'linear',
  responsive: true,
  target: 'parent',
  className: '',
  style: {}
};

const GRADUAL_BLUR_PRESETS = {
  top: { position: 'top', height: '6rem' },
  bottom: { position: 'bottom', height: '6rem' },
  left: { position: 'left', height: '6rem' },
  right: { position: 'right', height: '6rem' },
  subtle: { height: '4rem', strength: 1, opacity: 0.8, divCount: 3 },
  intense: { height: '10rem', strength: 4, divCount: 8, exponential: true },
  smooth: { height: '8rem', curve: 'bezier', divCount: 10 },
  sharp: { height: '5rem', curve: 'linear', divCount: 4 },
  header: { position: 'top', height: '8rem', curve: 'ease-out' },
  footer: { position: 'bottom', height: '8rem', curve: 'ease-out' },
  sidebar: { position: 'left', height: '6rem', strength: 2.5 },
  'page-header': { position: 'top', height: '10rem', target: 'page', strength: 3 },
  'page-footer': { position: 'bottom', height: '10rem', target: 'page', strength: 3 }
};

const GRADUAL_BLUR_CURVE_FUNCTIONS = {
  linear: p => p,
  bezier: p => p * p * (3 - 2 * p),
  'ease-in': p => p * p,
  'ease-out': p => 1 - Math.pow(1 - p, 2),
  'ease-in-out': p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
};

const mergeConfigs = (...configs) => configs.reduce((acc, c) => ({ ...acc, ...c }), {});

const getGradientDirection = position => {
  const directions = {
    top: 'to top',
    bottom: 'to bottom',
    left: 'to left',
    right: 'to right'
  };
  return directions[position] || 'to bottom';
};

const debounce = (fn, wait) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), wait);
  };
};

const useResponsiveDimension = (responsive, config, key) => {
  const [val, setVal] = useState(config[key]);
  useEffect(() => {
    if (!responsive) return;
    const calc = () => {
      const w = window.innerWidth;
      let v = config[key];
      if (w <= 480 && config['mobile' + key[0].toUpperCase() + key.slice(1)])
        v = config['mobile' + key[0].toUpperCase() + key.slice(1)];
      else if (w <= 768 && config['tablet' + key[0].toUpperCase() + key.slice(1)])
        v = config['tablet' + key[0].toUpperCase() + key.slice(1)];
      else if (w <= 1024 && config['desktop' + key[0].toUpperCase() + key.slice(1)])
        v = config['desktop' + key[0].toUpperCase() + key.slice(1)];
      setVal(v);
    };
    const deb = debounce(calc, 100);
    calc();
    window.addEventListener('resize', deb);
    return () => window.removeEventListener('resize', deb);
  }, [responsive, config, key]);
  return responsive ? val : config[key];
};

const useIntersectionObserver = (ref, shouldObserve = false) => {
  const [isVisible, setIsVisible] = useState(!shouldObserve);

  useEffect(() => {
    if (!shouldObserve || !ref.current) {
      // If not observing, ensure it's visible immediately
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.1 });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, shouldObserve]);

  return isVisible;
};

const GradualBlur = props => {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const config = useMemo(() => {
    const presetConfig = props.preset && GRADUAL_BLUR_PRESETS[props.preset] ? GRADUAL_BLUR_PRESETS[props.preset] : {};
    return mergeConfigs(DEFAULT_GRADUAL_BLUR_CONFIG, presetConfig, props);
  }, [props]);

  const responsiveHeight = useResponsiveDimension(config.responsive, config, 'height');
  const responsiveWidth = useResponsiveDimension(config.responsive, config, 'width');
  const isVisible = useIntersectionObserver(containerRef, config.animated === 'scroll');

  const blurDivs = useMemo(() => {
    const divs = [];
    const increment = 100 / config.divCount;
    const currentStrength =
      isHovered && config.hoverIntensity ? config.strength * config.hoverIntensity : config.strength;

    const curveFunc = GRADUAL_BLUR_CURVE_FUNCTIONS[config.curve] || GRADUAL_BLUR_CURVE_FUNCTIONS.linear;

    for (let i = 1; i <= config.divCount; i++) {
      let progress = i / config.divCount;
      progress = curveFunc(progress);

      let blurValue;
      if (config.exponential) {
        blurValue = Math.pow(2, progress * 4) * 0.0625 * currentStrength;
      } else {
        blurValue = 0.0625 * (progress * config.divCount + 1) * currentStrength;
      }
      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;
      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;

      const direction = getGradientDirection(config.position);

      const divStyle = {
        position: 'absolute',
        inset: '0',
        maskImage: `linear-gradient(${direction}, ${gradient})`,
        WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        opacity: config.opacity,
        transition:
          config.animated && config.animated !== 'scroll'
            ? `backdrop-filter ${config.duration} ${config.easing}`
            : undefined
      };

      divs.push(<div key={i} style={divStyle} />);
    }

    return divs;
  }, [config, isHovered]);

  const containerStyle = useMemo(() => {
    const isVertical = ['top', 'bottom'].includes(config.position);
    const isHorizontal = ['left', 'right'].includes(config.position);
    const isPageTarget = config.target === 'page';

    const baseStyle = {
      position: isPageTarget ? 'fixed' : 'absolute',
      pointerEvents: config.hoverIntensity ? 'auto' : 'none',
      opacity: isVisible ? 1 : 0,
      transition: config.animated ? `opacity ${config.duration} ${config.easing}` : undefined,
      zIndex: isPageTarget ? config.zIndex + 100 : config.zIndex,
      ...config.style
    };

    if (isVertical) {
      baseStyle.height = responsiveHeight;
      baseStyle.width = responsiveWidth || '100%';
      baseStyle[config.position] = 0;
      baseStyle.left = 0;
      baseStyle.right = 0;
    } else if (isHorizontal) {
      baseStyle.width = responsiveWidth || responsiveHeight;
      baseStyle.height = '100%';
      baseStyle[config.position] = 0;
      baseStyle.top = 0;
      baseStyle.bottom = 0;
    }

    return baseStyle;
  }, [config, responsiveHeight, responsiveWidth, isVisible]);

  const { hoverIntensity, animated, onAnimationComplete, duration } = config;
  useEffect(() => {
    if (isVisible && animated === 'scroll' && onAnimationComplete) {
      const t = setTimeout(() => onAnimationComplete(), parseFloat(duration) * 1000);
      return () => clearTimeout(t);
    }
  }, [isVisible, animated, onAnimationComplete, duration]);

  return (
    <div
      ref={containerRef}
      className={`gradual-blur ${config.target === 'page' ? 'gradual-blur-page' : 'gradual-blur-parent'} ${config.className}`}
      style={containerStyle}
      onMouseEnter={hoverIntensity ? () => setIsHovered(true) : undefined}
      onMouseLeave={hoverIntensity ? () => setIsHovered(false) : undefined}
    >
      <div className="gradual-blur-inner relative w-full h-full">{blurDivs}</div>
    </div>
  );
};

/* ================= COMPONENTS ================= */

// --- CardNav Component (for Header) ---
const CardNav = ({ 
  logo: LogoComponent, 
  items, 
  currentTheme, 
  onThemeChange, 
  userProfile, 
  onLogout,
  themeColors,
  transparency,
  blur
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef(null);

  const toggleMenu = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <nav
      ref={navRef}
      className="relative rounded-xl shadow-md overflow-hidden will-change-[height] transition-all duration-400"
      style={{
        backgroundColor: `rgba(255, 255, 255, ${transparency})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        minHeight: '60px',
        maxHeight: isExpanded ? '420px' : '60px',
        overflow: 'hidden',
        transition: 'max-height 0.4s ease',
        border: `1px solid rgba(255, 255, 255, 0.3)`
      }}
    >
      <div className="absolute inset-x-0 top-0 h-[60px] flex items-center justify-between p-2 pl-[1.1rem] z-[4]">
        <div
          className={`hamburger-menu group h-full flex flex-col items-center justify-center cursor-pointer gap-[6px] order-2 md:order-none ${themeColors.headerText}`}
          onClick={toggleMenu}
          role="button"
          aria-label={isExpanded ? 'Close menu' : 'Open menu'}
          tabIndex={0}
        >
          <div
            className={`hamburger-line w-[30px] h-[2px] bg-current transition-all duration-300 ease-linear ${
              isExpanded ? 'translate-y-[4px] rotate-45' : ''
            } group-hover:opacity-75`}
          />
          <div
            className={`hamburger-line w-[30px] h-[2px] bg-current transition-all duration-300 ease-linear ${
              isExpanded ? '-translate-y-[4px] -rotate-45' : ''
            } group-hover:opacity-75`}
          />
        </div>

        <div className="logo-container flex items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 order-1 md:order-none">
          {LogoComponent}
        </div>

        <div className="flex items-center gap-2 order-3">
          <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
          <span className={`text-xs font-medium ${themeColors.headerSecondary} bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full hidden md:block`}>
            {userProfile?.name || "Student"}
          </span>
          <button 
            onClick={onLogout} 
            className={`p-2 ${themeColors.navInactive} hover:text-red-500 transition-colors`}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div
        className={`absolute left-0 right-0 top-[60px] bottom-0 p-2 flex flex-col items-stretch gap-2 justify-start z-[1] transition-all duration-400 ${
          isExpanded ? 'visible pointer-events-auto opacity-100' : 'invisible pointer-events-none opacity-0'
        } md:flex-row md:items-end md:gap-[12px]`}
        aria-hidden={!isExpanded}
      >
        {(items || []).slice(0, 3).map((item, idx) => (
          <div
            key={`${item.label}-${idx}`}
            className="nav-card select-none relative flex flex-col gap-2 p-[12px_16px] rounded-[calc(0.75rem-0.2rem)] min-w-0 flex-[1_1_auto] h-auto min-h-[60px] md:h-full md:min-h-0 md:flex-[1_1_0%] transition-all duration-300 transform translate-y-0 opacity-100"
            style={{ 
              backgroundColor: item.bgColor || 'rgba(255, 255, 255, 0.9)', 
              color: item.textColor || themeColors.headerText.replace('text-', '')
            }}
          >
            <div className="nav-card-label font-normal tracking-[-0.5px] text-[18px] md:text-[22px]">
              {item.label}
            </div>
            <div className="nav-card-links mt-auto flex flex-col gap-[2px]">
              {item.links?.map((lnk, i) => (
                <button
                  key={`${lnk.label}-${i}`}
                  className="nav-card-link inline-flex items-center gap-[6px] no-underline cursor-pointer transition-opacity duration-300 hover:opacity-75 text-[15px] md:text-[16px] text-left"
                  onClick={lnk.onClick}
                  aria-label={lnk.ariaLabel}
                >
                  <ArrowRight className="nav-card-link-icon shrink-0" size={14} aria-hidden="true" />
                  {lnk.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
};

// --- PillNav Component (for Bottom Navbar) ---
const PillNav = ({
  items,
  activeTab,
  onTabChange,
  themeColors,
  transparency,
  blur
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef([]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handlePillHover = (index, isEntering) => {
    const circle = circleRefs.current[index];
    if (!circle) return;
    
    if (isEntering) {
      circle.style.transform = 'translateX(-50%) scale(1.2)';
    } else {
      circle.style.transform = 'translateX(-50%) scale(0)';
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000]">
      <nav
        className={`w-full flex items-center justify-center box-border px-4 py-2 border-t ${themeColors.border}`}
        aria-label="Primary"
            style={{
              backgroundColor: `rgba(255, 255, 255, ${transparency})`,
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`
            }}
      >
        <div
          className="relative items-center rounded-full hidden md:flex"
          style={{
            height: '42px',
            background: `rgba(255, 255, 255, ${transparency * 0.8})`,
            padding: '3px',
            gap: '3px'
          }}
        >
          <ul
            role="menubar"
            className="list-none flex items-stretch m-0 p-0 h-full"
            style={{ gap: '3px' }}
          >
            {items.map((item, i) => {
              const isActive = activeTab === item.id;

              return (
                <li key={item.id} role="none" className="flex h-full">
                  <button
                    role="menuitem"
                    onClick={() => onTabChange(item.id)}
                    className={`relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border font-semibold text-[16px] leading-[0] uppercase tracking-[0.2px] whitespace-nowrap cursor-pointer px-4 transition-all duration-300 ${
                      isActive ? themeColors.navActive : themeColors.navInactive
                    }`}
                    style={{
                      background: isActive 
                        ? `rgba(255, 255, 255, ${transparency * 0.6})` 
                        : `rgba(255, 255, 255, ${transparency * 0.4})`
                    }}
                    onMouseEnter={() => handlePillHover(i, true)}
                    onMouseLeave={() => handlePillHover(i, false)}
                    aria-label={item.label}
                  >
                    <span
                      className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none transition-transform duration-300 bg-current"
                      style={{
                        width: '100px',
                        height: '100px',
                        transform: 'translateX(-50%) scale(0)',
                        transformOrigin: '50% bottom'
                      }}
                      aria-hidden="true"
                      ref={el => {
                        circleRefs.current[i] = el;
                      }}
                    />
                    <span className="label-stack relative inline-block leading-[1] z-[2]">
                      <span className="pill-label relative z-[2] inline-block leading-[1]">
                        {item.label}
                      </span>
                    </span>
                    {isActive && (
                      <span
                        className={`absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 rounded-full z-[4] ${themeColors.navActive} bg-current`}
                        aria-hidden="true"
                      />
                    )}
                    {item.badge > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold z-[5]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="md:hidden rounded-full border-0 flex flex-col items-center justify-center gap-1 cursor-pointer p-0 relative"
          style={{
            width: '42px',
            height: '42px',
            background: `rgba(255, 255, 255, ${transparency})`
          }}
        >
          <span
            className={`hamburger-line w-4 h-0.5 rounded origin-center transition-all duration-300 ${
              isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''
            }`}
            style={{ background: themeColors.navInactive.replace('text-', '') }}
          />
          <span
            className={`hamburger-line w-4 h-0.5 rounded origin-center transition-all duration-300 ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''
            }`}
            style={{ background: themeColors.navInactive.replace('text-', '') }}
          />
        </button>
      </nav>

      <div
        className={`md:hidden absolute bottom-[3.5em] left-4 right-4 rounded-[27px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-[998] origin-top transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'
        }`}
        style={{
          background: `rgba(255, 255, 255, ${transparency})`,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`
        }}
      >
        <ul className="list-none m-0 p-[3px] flex flex-col gap-[3px]">
          {items.map(item => (
            <li key={item.id}>
              <button
                className={`block py-3 px-4 text-[16px] font-medium rounded-[50px] transition-all duration-200 w-full text-left ${
                  activeTab === item.id ? themeColors.navActive : themeColors.navInactive
                }`}
                style={{
                  background: activeTab === item.id 
                    ? `rgba(255, 255, 255, ${transparency * 0.6})` 
                    : `rgba(255, 255, 255, ${transparency * 0.4})`
                }}
                onClick={() => {
                  onTabChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
              >
                {item.label}
                {item.badge > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// --- Shared UI Components ---
const GlareButton = ({ children, onClick, variant = "primary", className = "", disabled = false, type = "button" }) => {
  const variants = {
    primary: { bg: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)", glare: "#a5b4fc", text: "text-white" },
    secondary: { bg: "rgba(255,255,255,0.9)", glare: "#6366f1", text: "text-slate-700 border border-slate-200" },
    danger: { bg: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)", glare: "#f87171", text: "text-red-600" },
    ghost: { bg: "transparent", glare: "#94a3b8", text: "text-slate-600" },
    success: { bg: "linear-gradient(135deg, #059669 0%, #10b981 100%)", glare: "#6ee7b7", text: "text-white" }
  };
  const v = variants[variant] || variants.primary;

  return (
    <GlareHover
      width="100%"
      height="auto"
      background={v.bg}
      borderRadius="12px"
      borderColor="transparent"
      glareColor={v.glare}
      glareOpacity={0.3}
      glareAngle={-30}
      glareSize={200}
      transitionDuration={400}
      className={`${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      style={{ display: 'inline-flex' }}
    >
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 ${v.text}`}
      >
        {children}
      </button>
    </GlareHover>
  );
};

// Simple button for non-glare uses
const Button = ({ children, onClick, variant = "primary", className = "", disabled = false, type = "button", noGlare = false }) => {
  if (noGlare) {
    const base = "px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100";
    const variants = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200",
      secondary: "bg-white/90 backdrop-blur-sm text-slate-700 border border-slate-200 hover:bg-white shadow-sm",
      danger: "bg-red-50 text-red-600 hover:bg-red-100",
      ghost: "text-slate-600 hover:bg-slate-100 bg-transparent",
      success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200"
    };
    return (
      <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
        {children}
      </button>
    );
  }
  return <GlareButton type={type} onClick={onClick} variant={variant} className={className} disabled={disabled}>{children}</GlareButton>;
};

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</label>}
    <input
      className="w-full px-4 py-3 rounded-xl border border-white/30 bg-white/70 backdrop-blur-sm focus:bg-white/90 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
      {...props}
    />
  </div>
);
const Card = ({ children, className = "", transparency = 0.4 }) => (
  <div
    className={`backdrop-blur-lg border border-white/20 p-4 rounded-2xl shadow-lg ${className}`}
    style={{
      backgroundColor: `rgba(255, 255, 255, ${transparency})`,
    }}
  >
    {children}
  </div>
);


// --- Auth Screens ---
const AuthScreen = ({ role, onLogin, onSignup, setStep, setRole, currentTheme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [masterKey, setMasterKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        await onSignup(email, password, masterKey);
      }
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      if (isLogin) await onLogin(null, null, "google");
      else await onSignup(null, null, masterKey, "google");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* DarkVeil Background */}
      <div className="absolute inset-0 z-0">
        <DarkVeil theme={currentTheme} />
      </div>
      
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/30 z-0" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm text-white mb-4 shadow-xl">
            <Utensils size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Campus Eats</h1>
          <p className="text-white/80 mt-2">Ordering food made simple</p>
        </div>

        <Card className="p-6 md:p-8 bg-white/70 backdrop-blur-xl">
          <div className="flex gap-2 p-1 bg-white/50 rounded-xl mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Sign Up
            </button>
          </div>

          <h2 className="text-xl font-semibold mb-6 text-slate-800">
            {isLogin ? `Welcome back, ${role === "student" ? "Student" : "Staff"}!` : `Create ${role} Account`}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                label="Master Key"
                type="text"
                placeholder="Enter master key"
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
              />
            )}
            <Input
              label="Email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <div className="p-3 rounded-lg bg-red-500/20 backdrop-blur-sm text-red-700 text-sm flex items-center gap-2"><ArrowRight size={14}/> {error}</div>}

            <Button disabled={loading} type="submit" className="w-full">
              {loading ? "Processing..." : (isLogin ? "Log In" : "Create Account")}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/30">
             <Button variant="secondary" onClick={handleGoogle} className="w-full">
                {isLogin ? "Log in with Google" : "Sign up with Google"}
             </Button>
          </div>
        </Card>

        <button
          onClick={() => { setStep("role"); setRole(null); }}
          className="w-full mt-6 text-sm text-white/80 hover:text-white font-medium"
        >
          ← Change Role
        </button>
      </div>
    </div>
  );
};

// --- Student App ---
const StudentApp = ({ menu, orders, addToOrder, user, userProfile, updateUserProfile, logout, currentTheme, onThemeChange }) => {
  // Adjustable transparency and blur values (edit these to change appearance)
  const HEADER_TRANSPARENCY = 0.1; // 0-1 (0 = fully transparent, 1 = fully opaque)
  const HEADER_BLUR = 9; // pixels (0-24)
  const NAV_TRANSPARENCY = 0.4; // 0-1 (0 = fully transparent, 1 = fully opaque)
  const NAV_BLUR = 15; // pixels (0-24)

  const [activeTab, setActiveTab] = useState("menu");
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [profileForm, setProfileForm] = useState({ name: "", studentId: "", phone: "" });
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (userProfile) setProfileForm(userProfile);
  }, [userProfile]);

  const addItem = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQty = (itemId, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        return { ...i, qty: Math.max(1, i.qty + delta) };
      }
      return i;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const handlePlaceOrder = () => {
    if (!profileForm.name || !profileForm.studentId) {
      alert("Please complete your profile first!");
      setActiveTab("profile");
      return;
    }
    if (cart.length === 0) return;

    addToOrder({
      orderId: generateOrderId(),
      items: cart,
      totalAmount: cartTotal,
      studentUid: user.uid,
      studentName: profileForm.name,
      orderStatus: "Placed",
      paymentStatus: "Paid",
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    });
    setCart([]);
    setActiveTab("orders");
  };

  const filteredMenu = menu.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* DarkVeil Background */}
      <div className="absolute inset-0 z-0">
        <DarkVeil theme={currentTheme} />
      </div>
      <div className="absolute inset-0 bg-black/10 z-0" />

      {/* Header - CardNav Style */}
      {(() => {
        const navColors = getThemeNavColors(currentTheme);
        const cardNavItems = [
          {
            label: "Quick Actions",
            bgColor: `rgba(79, 70, 229, 0.9)`,
            textColor: "#fff",
            links: [
              { label: "View Menu", ariaLabel: "View Menu", onClick: () => setActiveTab("menu") },
              { label: "My Orders", ariaLabel: "My Orders", onClick: () => setActiveTab("orders") }
            ]
          },
          {
            label: "Account",
            bgColor: `rgba(99, 102, 241, 0.9)`,
            textColor: "#fff",
            links: [
              { label: "Profile", ariaLabel: "View Profile", onClick: () => setActiveTab("profile") },
              { label: "Settings", ariaLabel: "Settings", onClick: () => {} }
            ]
          },
          {
            label: "Help",
            bgColor: `rgba(139, 92, 246, 0.9)`,
            textColor: "#fff",
            links: [
              { label: "Support", ariaLabel: "Get Support", onClick: () => {} },
              { label: "About", ariaLabel: "About Campus Eats", onClick: () => {} }
            ]
          }
        ];
        
        const LogoComponent = (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Utensils size={16} />
            </div>
            <h1 className={`font-bold ${navColors.headerText} text-lg`}>Campus Eats</h1>
          </div>
        );

        return (
          <div
  className="sticky top-4 z-30 px-4 pointer-events-auto"
  style={{ isolation: "isolate" }}
>
            <CardNav
              logo={LogoComponent}
              items={cardNavItems}
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
              userProfile={userProfile}
              onLogout={logout}
              themeColors={navColors}
              transparency={HEADER_TRANSPARENCY}
              blur={HEADER_BLUR}
            />
          </div>
        );
      })()}

      {/* Main Content Area */}
      <main 
        className="flex-1 relative z-10" 
        style={activeTab === "menu" ? { overflow: 'hidden' } : { overflowY: 'auto', paddingBottom: '6rem' }}
      >
        
        {/* MENU VIEW */}
        {activeTab === "menu" && (() => {
          const themeColors = getThemeCardColors(currentTheme);
          const blurHeight = windowWidth <= 768 ? '4rem' : '7rem';
          
          return (
            <section style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
              <div style={{ height: '100%', overflowY: 'auto', padding: '1rem', paddingBottom: blurHeight }}>
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search food..." 
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/70 backdrop-blur-sm border border-white/30 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMenu.map(item => (
                      <Card 
                        key={item.id} 
                        className={`flex flex-col gap-3 hover:shadow-xl transition-all duration-300 ${themeColors.bg} ${themeColors.border}`}
                        style={{ borderWidth: '1px' }}
                      >
                        <div className="flex justify-between items-start">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${item.color || 'bg-white/50'}`}>
                            {item.image}
                          </div>
                          <span className={`text-sm font-semibold ${themeColors.text} bg-white/50 px-2 py-1 rounded-md`}>
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                        <div>
                          <h3 className={`font-bold ${themeColors.text}`}>{item.name}</h3>
                          <p className={`text-xs ${themeColors.textSecondary} line-clamp-2 mt-1`}>{item.desc}</p>
                        </div>
                        <Button 
                          variant="secondary" 
                          className="w-full mt-auto"
                          onClick={() => addItem(item)}
                        >
                          Add to Cart
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              <GradualBlur
                target="parent"
                position="bottom"
                height={blurHeight}
                mobileHeight="4rem"
                desktopHeight="7rem"
                strength={2}
                divCount={5}
                curve="bezier"
                exponential
                opacity={1}
                animated={true}
                responsive={true}
              />
            </section>
          );
        })()}
        
        {/* Floating Cart Button for Mobile */}
        {activeTab === "menu" && cartCount > 0 && (
              <div className="fixed bottom-20 left-4 right-4 z-20">
                <GlareHover
                  width="100%"
                  height="auto"
                  background="linear-gradient(135deg, #1e293b 0%, #334155 100%)"
                  borderRadius="12px"
                  borderColor="transparent"
                  glareColor="#6366f1"
                  glareOpacity={0.3}
                  transitionDuration={400}
                >
                  <button 
                    onClick={() => setActiveTab("cart")}
                    className="w-full text-white p-4 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-500 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
                        {cartCount}
                      </div>
                      <span className="font-medium">View Cart</span>
                    </div>
                    <span className="font-bold">{formatCurrency(cartTotal)}</span>
                  </button>
                </GlareHover>
              </div>
        )}

        {/* CART VIEW */}
        {activeTab === "cart" && (
          <div className="p-4 max-w-2xl mx-auto h-full flex flex-col">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-6">Your Cart</h2>
            
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-white/70 space-y-4">
                <ShoppingBag size={64} strokeWidth={1} />
                <p>Your cart is empty</p>
                <Button variant="ghost" onClick={() => setActiveTab("menu")} noGlare>Browse Menu</Button>
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                {cart.map(item => (
                  <div key={item.id} className="bg-white/70 backdrop-blur-md p-4 rounded-xl border border-white/30 flex items-center gap-4 shadow-lg">
                    <div className="text-2xl">{item.image}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">{item.name}</h4>
                      <p className="text-sm text-slate-500">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/50 rounded-lg p-1">
                      <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white rounded-md transition-colors"><Minus size={14}/></button>
                      <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white rounded-md transition-colors"><Plus size={14}/></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500 p-2">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                
                <Card className="mt-8 p-6 space-y-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl text-slate-900 pt-4 border-t border-white/30">
                    <span>Total</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <Button onClick={handlePlaceOrder} className="w-full">
                    Place Order
                  </Button>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ORDERS VIEW (Student) */}
        {activeTab === "orders" && (
          <div className="p-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-6">Order History</h2>
            <div className="space-y-6">
              {orders.filter(o => o.studentUid === user.uid).sort((a,b) => b.timestamp - a.timestamp).map(order => {
                // Generate the display code from the order ID (e.g., ORD-1234 -> 1234)
                const pickupCode = order.orderId.split('-')[1] || order.orderId;
                
                return (
                  <Card key={order.orderId} className={`overflow-hidden border-l-4 ${order.orderStatus === 'Served' ? 'border-l-green-500 opacity-80' : 'border-l-indigo-500'}`}>
                    {order.orderStatus === "Placed" && (
                      <div className="bg-indigo-500/20 backdrop-blur-sm -m-4 mb-4 p-6 flex flex-col items-center justify-center text-center border-b border-indigo-200/30">
                        <div className="bg-white/80 backdrop-blur-sm p-2 rounded-xl mb-3 shadow-lg">
                          <QrCode size={80} className="text-slate-800"/>
                        </div>
                        <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Pickup Code</p>
                        <h3 className="text-4xl font-black text-indigo-600 tracking-wider font-mono">{pickupCode}</h3>
                        <p className="text-xs text-slate-600 mt-2">Show this code to the staff to collect your order</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800">Order #{pickupCode}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                            order.orderStatus === "Served" ? "bg-green-500/20 text-green-700" : "bg-blue-500/20 text-blue-700"
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <span className="font-bold text-slate-900">{formatCurrency(order.totalAmount)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-slate-600 border-b border-white/20 last:border-0 pb-2 last:pb-0">
                          <span>{item.qty}x {item.name}</span>
                          <span>{formatCurrency(item.price * item.qty)}</span>
                        </div>
                      ))}
                    </div>
                    
                    {order.orderStatus === "Served" && (
                      <div className="mt-4 pt-3 border-t border-white/20 text-center">
                        <p className="text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                          <CheckCircle size={12}/> Order Picked Up
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })}
              
              {orders.filter(o => o.studentUid === user.uid).length === 0 && (
                 <div className="text-center text-white/60 py-10">No orders yet</div>
              )}
            </div>
          </div>
        )}

        {/* PROFILE VIEW */}
        {activeTab === "profile" && (
          <div className="p-4 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-6">My Profile</h2>
            <Card className="space-y-4">
              <div className="flex justify-center mb-4">
                 <div className="w-20 h-20 bg-indigo-500/30 backdrop-blur-sm text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold">
                    {profileForm.name ? profileForm.name[0].toUpperCase() : <User />}
                 </div>
              </div>
              <Input 
                label="Full Name" 
                value={profileForm.name} 
                onChange={e => setProfileForm({...profileForm, name: e.target.value})} 
              />
              <Input 
                label="Student ID / Roll No" 
                value={profileForm.studentId} 
                onChange={e => setProfileForm({...profileForm, studentId: e.target.value})} 
              />
              <Input 
                label="Phone Number" 
                value={profileForm.phone || ""} 
                onChange={e => setProfileForm({...profileForm, phone: e.target.value})} 
              />
              <div className="pt-4">
                <Button onClick={() => updateUserProfile(profileForm)} className="w-full">
                  Save Changes
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Bottom Navigation - PillNav Style */}
      {(() => {
        const navColors = getThemeNavColors(currentTheme);
        const pillNavItems = [
          { id: "menu", label: "Menu" },
          { id: "cart", label: "Cart", badge: cartCount },
          { id: "orders", label: "Orders" },
          { id: "profile", label: "Profile" }
        ];
        
        return (
          <PillNav
            items={pillNavItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            themeColors={navColors}
            transparency={NAV_TRANSPARENCY}
            blur={NAV_BLUR}
          />
        );
      })()}
    </div>
  );
};

// --- Staff App ---
const StaffApp = ({ orders, updateOrder, logout, menu, onUpdateMenu, onDeleteMenu, onAddMenu, currentTheme, onThemeChange }) => {
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | menu
  const [filter, setFilter] = useState("Placed");
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  
  // Menu Editing State
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [menuForm, setMenuForm] = useState({ name: "", price: "", category: "", desc: "", image: "🍲" });
  const [editingItemId, setEditingItemId] = useState(null);

  const filteredOrders = orders
    .filter(o => filter === "All" ? true : o.orderStatus === filter)
    .sort((a,b) => b.timestamp - a.timestamp);

  const stats = {
    pending: orders.filter(o => o.orderStatus === "Placed").length,
    served: orders.filter(o => o.orderStatus === "Served").length,
    revenue: orders.reduce((acc, o) => acc + o.totalAmount, 0)
  };

  const handleVerify = () => {
    if (!selectedOrder) return;
    const actualCode = selectedOrder.orderId.split('-')[1];
    
    if (verificationCode === actualCode) {
      updateOrder(selectedOrder.orderId, { orderStatus: "Served" });
      setVerifyModalOpen(false);
      setVerificationCode("");
      setSelectedOrder(null);
    } else {
      alert("Incorrect Code! Please check with the student.");
    }
  };

  const handleSaveMenu = () => {
    if (!menuForm.name || !menuForm.price) return alert("Name and Price required");
    
    const itemData = {
      ...menuForm,
      price: Number(menuForm.price),
      available: true
    };

    if (editingItemId) {
      onUpdateMenu(editingItemId, itemData);
    } else {
      onAddMenu({ ...itemData, id: Date.now() }); // Simple ID for now
    }
    
    setIsEditingMenu(false);
    setMenuForm({ name: "", price: "", category: "", desc: "", image: "🍲" });
    setEditingItemId(null);
  };

  const openEditMenu = (item) => {
    setMenuForm(item);
    setEditingItemId(item.docId); // Use Firestore doc ID
    setIsEditingMenu(true);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* DarkVeil Full Background */}
      <div className="fixed inset-0 z-0">
        <DarkVeil theme={currentTheme} />
      </div>
      <div className="fixed inset-0 bg-black/20 z-0" />

      <header className="relative z-10 text-white px-6 py-4 flex justify-between items-center shadow-md sticky top-0 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center gap-3">
          <ChefHat className="text-orange-400" />
          <div>
             <h1 className="font-bold text-lg leading-none">Kitchen Dashboard</h1>
             <p className="text-xs text-white/60">Manage orders efficiently</p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
           <button 
             onClick={() => setActiveTab("dashboard")} 
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-orange-500 text-white' : 'text-white/70 hover:text-white'}`}
           >
             Orders
           </button>
           <button 
             onClick={() => setActiveTab("menu")} 
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'menu' ? 'bg-orange-500 text-white' : 'text-white/70 hover:text-white'}`}
           >
             Menu
           </button>
           <button onClick={logout} className="ml-4 p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors">
             <LogOut size={18}/>
           </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full relative z-10">
        {activeTab === "dashboard" && (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="flex items-center gap-4 border-l-4 border-l-blue-500">
                 <div className="p-3 bg-blue-500/20 text-blue-400 rounded-full"><Clock/></div>
                 <div>
                    <p className="text-sm text-slate-600 font-medium">Pending Orders</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
                 </div>
              </Card>
              <Card className="flex items-center gap-4 border-l-4 border-l-green-500">
                 <div className="p-3 bg-green-500/20 text-green-500 rounded-full"><CheckCircle/></div>
                 <div>
                    <p className="text-sm text-slate-600 font-medium">Completed</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.served}</p>
                 </div>
              </Card>
              <Card className="flex items-center gap-4 border-l-4 border-l-indigo-500">
                 <div className="p-3 bg-indigo-500/20 text-indigo-500 rounded-full"><CreditCard/></div>
                 <div>
                    <p className="text-sm text-slate-600 font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.revenue)}</p>
                 </div>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {["Placed", "Served", "All"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap ${
                    filter === f 
                    ? "bg-white/90 text-slate-800 shadow-lg backdrop-blur-sm" 
                    : "bg-white/30 backdrop-blur-sm text-white hover:bg-white/50"
                  }`}
                >
                  {f === "Placed" ? "Pending" : f}
                </button>
              ))}
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map(order => (
                <Card key={order.orderId} className={`flex flex-col h-full hover:shadow-xl transition-all ${order.orderStatus === "Served" ? "opacity-75" : ""}`}>
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/20">
                     <div>
                        {/* HIDE ORDER ID from Staff to force verification */}
                        <div className="flex items-center gap-2 mb-1">
                          <User size={16} className="text-slate-400"/>
                          <h3 className="font-bold text-lg text-slate-800">{order.studentName}</h3>
                        </div>
                        <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                     </div>
                     <div className="text-right">
                        <p className="font-bold text-slate-900 bg-white/50 px-2 py-1 rounded">{formatCurrency(order.totalAmount)}</p>
                     </div>
                  </div>

                  <div className="flex-1 space-y-3 mb-6">
                     {order.items.map((item, i) => (
                       <div key={i} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                             <span className="bg-white/50 text-slate-700 font-bold px-2 py-0.5 rounded text-xs">{item.qty}x</span>
                             <span className="text-slate-700">{item.name}</span>
                          </div>
                       </div>
                     ))}
                  </div>

                  {order.orderStatus === "Placed" ? (
                    <Button 
                       onClick={() => {
                         setSelectedOrder(order);
                         setVerifyModalOpen(true);
                       }}
                       className="w-full mt-auto"
                    >
                       Verify & Serve <QrCode size={18}/>
                    </Button>
                  ) : (
                    <div className="mt-auto text-center py-2 bg-green-500/20 text-green-700 rounded-lg font-medium text-sm flex items-center justify-center gap-2">
                       <CheckCircle size={16}/> Served
                    </div>
                  )}
                </Card>
              ))}
              
              {filteredOrders.length === 0 && (
                 <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/50">
                    <Coffee size={48} className="mb-4 opacity-20"/>
                    <p>No orders found for this filter.</p>
                 </div>
              )}
            </div>
          </>
        )}

        {/* MENU MANAGEMENT TAB */}
        {activeTab === "menu" && (
          <div className="max-w-4xl mx-auto">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-white drop-shadow-lg">Menu Management</h2>
               <Button onClick={() => {
                 setMenuForm({ name: "", price: "", category: "", desc: "", image: "🍲" });
                 setEditingItemId(null);
                 setIsEditingMenu(true);
               }} className="gap-2">
                 <PlusCircle size={20}/> Add Item
               </Button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {menu.map(item => (
                 <Card key={item.id} className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-white/50 rounded-lg flex items-center justify-center text-3xl">
                      {item.image}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-slate-800">{item.name}</h3>
                        <span className="font-medium text-slate-600">{formatCurrency(item.price)}</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{item.category}</p>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => openEditMenu(item)} className="p-1.5 text-blue-600 hover:bg-blue-500/20 rounded-lg transition-colors">
                          <Edit size={16}/>
                        </button>
                        <button onClick={() => onDeleteMenu(item.docId)} className="p-1.5 text-red-600 hover:bg-red-500/20 rounded-lg transition-colors">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>
                 </Card>
               ))}
             </div>
          </div>
        )}
      </main>

      {/* VERIFICATION MODAL */}
      {verifyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 border border-white/30">
             <div className="text-center mb-6">
               <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                 <QrCode size={32}/>
               </div>
               <h3 className="text-xl font-bold text-slate-900">Verify Order</h3>
               <p className="text-sm text-slate-500 mt-2">Enter the 4-digit code shown on the student's device.</p>
             </div>
             
             <input
               autoFocus
               type="text" 
               maxLength={4}
               placeholder="0000"
               className="w-full text-center text-3xl tracking-[1em] font-mono font-bold border-b-2 border-slate-200 focus:border-indigo-600 outline-none py-4 mb-6 bg-transparent"
               value={verificationCode}
               onChange={e => setVerificationCode(e.target.value)}
             />
             
             <div className="grid grid-cols-2 gap-3">
               <Button variant="secondary" onClick={() => setVerifyModalOpen(false)}>Cancel</Button>
               <Button onClick={handleVerify}>Confirm</Button>
             </div>
          </div>
        </div>
      )}

      {/* MENU EDIT MODAL */}
      {isEditingMenu && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh] border border-white/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">{editingItemId ? "Edit Item" : "New Item"}</h3>
              <button onClick={() => setIsEditingMenu(false)} className="text-slate-400 hover:text-slate-600"><X/></button>
            </div>
            
            <div className="space-y-4">
              <Input label="Item Name" value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Price (₹)" type="number" value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} />
                <Input label="Category" placeholder="Lunch, Snacks..." value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})} />
              </div>
              <Input label="Description" value={menuForm.desc} onChange={e => setMenuForm({...menuForm, desc: e.target.value})} />
              <Input label="Image (Emoji)" value={menuForm.image} onChange={e => setMenuForm({...menuForm, image: e.target.value})} />
              
              <div className="pt-4 flex gap-3">
                 <Button className="flex-1" onClick={handleSaveMenu}>Save Item</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// --- Theme Selector Component ---
const ThemeSelector = ({ currentTheme, onThemeChange, variant = "dark" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ThemeIcon = THEME_ICONS[currentTheme] || Palette;

  const buttonClass = variant === "dark" 
    ? "p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all flex items-center gap-2"
    : "p-2 bg-slate-800/80 backdrop-blur-sm rounded-lg text-white hover:bg-slate-800 transition-all flex items-center gap-2";

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className={buttonClass}>
        <ThemeIcon size={18} />
        <span className="text-xs font-medium capitalize hidden sm:inline">{currentTheme}</span>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
          className="fixed right-4 top-[72px] bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-2 z-[1000] min-w-[180px]"
        >

            {Object.keys(THEMES).map(theme => {
              const Icon = THEME_ICONS[theme] || Palette;
              return (
                <button
                  key={theme}
                  onClick={() => {
                    onThemeChange(theme);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    currentTheme === theme
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium capitalize">{theme}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// --- Role Selector ---
const RoleSelector = ({ onSelect, currentTheme, onThemeChange }) => (
  <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
    {/* DarkVeil Background */}
    <div className="absolute inset-0 z-0">
      <DarkVeil theme={currentTheme} />
    </div>
    
    {/* Overlay */}
    <div className="absolute inset-0 bg-black/20 z-0" />

    {/* Theme Selector - Top Right */}
    <div className="absolute top-4 right-4 z-20">
      <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
    </div>

    <div className="relative z-10">
      <div className="text-center mb-10 animate-in slide-in-from-top-10 fade-in duration-700">
         <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">Campus Eats</h1>
         <p className="text-lg text-white/80">Choose your portal to continue</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
         <GlareHover
           width="100%"
           height="auto"
           background="rgba(255,255,255,0.7)"
           borderRadius="24px"
           borderColor="rgba(99,102,241,0.3)"
           glareColor="#6366f1"
           glareOpacity={0.3}
           glareAngle={-30}
           glareSize={300}
           transitionDuration={600}
           className="cursor-pointer backdrop-blur-md"
           style={{ minHeight: '220px' }}
         >
           <button
             onClick={() => onSelect("student")}
             className="w-full h-full p-8 flex flex-col items-center text-center gap-4"
           >
             <div className="w-20 h-20 bg-indigo-500/20 backdrop-blur-sm text-indigo-600 rounded-2xl flex items-center justify-center mb-2">
                <User size={40} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-800">Student</h3>
                <p className="text-sm text-slate-600 mt-2">Browse menu, place orders, and track your food history.</p>
             </div>
           </button>
         </GlareHover>

         <GlareHover
           width="100%"
           height="auto"
           background="rgba(255,255,255,0.7)"
           borderRadius="24px"
           borderColor="rgba(249,115,22,0.3)"
           glareColor="#f97316"
           glareOpacity={0.3}
           glareAngle={-30}
           glareSize={300}
           transitionDuration={600}
           className="cursor-pointer backdrop-blur-md"
           style={{ minHeight: '220px' }}
         >
           <button 
             onClick={() => onSelect("staff")}
             className="w-full h-full p-8 flex flex-col items-center text-center gap-4"
           >
             <div className="w-20 h-20 bg-orange-500/20 backdrop-blur-sm text-orange-600 rounded-2xl flex items-center justify-center mb-2">
                <ChefHat size={40} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-800">Canteen Staff</h3>
                <p className="text-sm text-slate-600 mt-2">Manage incoming orders, update status, and view sales.</p>
             </div>
           </button>
         </GlareHover>
      </div>
    </div>
  </div>
);

/* ================= MAIN CONTROLLER ================= */

export default function App() {
  const [step, setStep] = useState("role"); // role | auth | app
  const [role, setRole] = useState(null); // student | staff
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  // Theme State - persisted in localStorage
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('campuseats-theme');
    return saved || 'morning';
  });

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('campuseats-theme', theme);
  };
  
  // Data State
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);

  /* --- AUTH & INIT --- */
  useEffect(() => {
    // Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Check for user profile in Firestore
        const userDocRef = doc(db, "artifacts", APP_ID, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          setUser(currentUser);
          const data = userDocSnap.data();
          setUserProfile(data);
          // If role matches or if we want to auto-redirect
          setRole(data.role); 
          setStep("app");
        } else {
          // User authenticated but no profile (mid-signup state or error)
          // We'll handle this in the signup flow
          setUser(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setStep("role");
      }
    });
    return () => unsubscribeAuth();
  }, []);

  /* --- DATA LISTENERS --- */
  useEffect(() => {
    // 1. Menu Listener (Global - always listen if app is mounted or just when user is active)
    const menuRef = collection(db, "artifacts", APP_ID, "public", "data", "menu");
    const unsubscribeMenu = onSnapshot(menuRef, (snapshot) => {
      const loadedMenu = snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
      if (loadedMenu.length > 0) {
        setMenu(loadedMenu);
      } else {
        // Seed initial menu if empty
        setMenu(INITIAL_MENU);
        INITIAL_MENU.forEach(item => {
           addDoc(menuRef, item);
        });
      }
    });

    if (!user) return unsubscribeMenu;
    
    // 2. Orders Listener (Only when logged in)
    const ordersRef = collection(db, "artifacts", APP_ID, "public", "data", "orders");
    const unsubscribeOrders = onSnapshot(ordersRef, (snapshot) => {
      const loadedOrders = snapshot.docs.map(doc => ({
        ...doc.data(),
        docId: doc.id // Important for updates
      }));
      setOrders(loadedOrders);
    });

    return () => {
      unsubscribeMenu();
      unsubscribeOrders();
    };
  }, [user]);

  /* --- ACTIONS --- */
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep("auth");
  };

  const handleLogin = async (email, password, method = "email") => {
    if (method === "google") {
      await signInWithPopup(auth, googleProvider);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  };

  const handleSignup = async (email, password, masterKey, method = "email") => {
    if (masterKey !== MASTER_KEY) throw new Error("Invalid Master Key");
    
    let userCredential;
    if (method === "google") {
      userCredential = await signInWithPopup(auth, googleProvider);
    } else {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    }

    const profileData = {
      uid: userCredential.user.uid,
      role: role,
      email: userCredential.user.email,
      name: userCredential.user.displayName || "",
      provider: method,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, "artifacts", APP_ID, "users", userCredential.user.uid), profileData);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setStep("role");
    setRole(null);
  };

  const addToOrder = async (orderData) => {
    await addDoc(collection(db, "artifacts", APP_ID, "public", "data", "orders"), orderData);
  };

  const updateOrder = async (orderId, updates) => {
    const order = orders.find(o => o.orderId === orderId);
    if (!order || !order.docId) return;
    
    await updateDoc(
      doc(db, "artifacts", APP_ID, "public", "data", "orders", order.docId),
      updates
    );
  };

  // Menu Management Actions
  const handleAddMenuItem = async (item) => {
    await addDoc(collection(db, "artifacts", APP_ID, "public", "data", "menu"), item);
  };

  const handleUpdateMenuItem = async (docId, updates) => {
    await updateDoc(doc(db, "artifacts", APP_ID, "public", "data", "menu", docId), updates);
  };

  const handleDeleteMenuItem = async (docId) => {
    await deleteDoc(doc(db, "artifacts", APP_ID, "public", "data", "menu", docId));
  };

  const updateUserProfile = async (data) => {
    if (!user) return;
    await setDoc(doc(db, "artifacts", APP_ID, "users", user.uid), data, { merge: true });
    setUserProfile(prev => ({ ...prev, ...data }));
  };

  /* --- RENDER --- */
  if (step === "role") {
    return (
      <RoleSelector 
        onSelect={handleRoleSelect} 
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />
    );
  }

  if (step === "auth") {
    return (
      <AuthScreen 
        role={role} 
        onLogin={handleLogin} 
        onSignup={handleSignup}
        setStep={setStep}
        setRole={setRole}
        currentTheme={currentTheme}
      />
    );
  }

  if (step === "app" && user && userProfile) {
    if (userProfile.role === "student") {
      return (
        <StudentApp 
          menu={menu}
          orders={orders}
          addToOrder={addToOrder}
          user={user}
          userProfile={userProfile}
          updateUserProfile={updateUserProfile}
          logout={handleLogout}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      );
    } else {
      return (
        <StaffApp 
          orders={orders}
          menu={menu}
          updateOrder={updateOrder}
          onAddMenu={handleAddMenuItem}
          onUpdateMenu={handleUpdateMenuItem}
          onDeleteMenu={handleDeleteMenuItem}
          logout={handleLogout}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      );
    }
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-indigo-600">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-current"></div>
    </div>
  );
}
