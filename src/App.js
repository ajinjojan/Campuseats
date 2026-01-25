import React, { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Utensils, ShoppingBag, CreditCard, Wallet,
  CheckCircle, User, LogOut, Settings, HelpCircle, Info,
  Coffee, Clock, Search, Plus, Minus, Heart,
  ChefHat, Trash2, ArrowRight, QrCode,
  Edit, PlusCircle, X, Leaf, Flame, Wheat, Fish, Moon, Package
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
  getDoc,
  getDocs,
  writeBatch,
  query,
  where
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


import DarkVeil, { THEMES } from "./components/DarkVeil";
import GlareHover from "./components/GlareHover";

// Food-based theme icons
const THEME_ICONS = {
  fresh: Leaf,
  spice: Flame,
  harvest: Wheat,
  coastal: Fish,
  grill: Flame,
  midnight: Moon
};
const DEFAULT_THEME = "fresh";
const FOOD_THEME_KEYS = ["fresh", "spice", "harvest", "coastal", "grill", "midnight"];

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
const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// App Constants
const APP_ID = "campuseats-live-v1";
const MASTER_KEY = "master123";
const menuRef = collection(db, "artifacts", APP_ID, "public", "data", "menu");
const categoriesRef = collection(db, "artifacts", APP_ID, "public", "data", "categories");
const usersRef = collection(db, "artifacts", APP_ID, "users");
const inventoryRef = collection(db, "artifacts", APP_ID, "public", "data", "inventory");

/* ================= ADJUSTABLE CONFIG (edit here) ================= */
const APP_CONFIG = {
  CARD_TRANSPARENCY: 0.3,           // Card background opacity (0–1). Adjust as needed.
  HELP_PHONE: "8075648240",
  HELP_EMAIL: "dudethunder65@gmail.com",
  ABOUT_TEAM: "Made by team a²",
};

/* ================= UTILS ================= */

const generateOrderId = () => `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

const formatCurrency = (amount) => `₹${amount}`;

// Food-based theme colors (fresh, spice, harvest, coastal, grill, midnight)
const getThemeCardColors = (theme) => {
  const themeColors = {
    fresh: {
      bg: 'bg-emerald-950/90',
      border: 'border-emerald-800/50',
      text: 'text-emerald-50',
      textSecondary: 'text-emerald-300',
      accent: 'bg-emerald-500/25',
      badgeBg: 'bg-emerald-800/80',
      badgeBorder: 'border-emerald-700/40',
      borderL: 'border-l-emerald-500'
    },
    spice: {
      bg: 'bg-red-950/90',
      border: 'border-red-800/50',
      text: 'text-red-50',
      textSecondary: 'text-red-300',
      accent: 'bg-red-500/25',
      badgeBg: 'bg-red-800/80',
      badgeBorder: 'border-red-700/40',
      borderL: 'border-l-red-500'
    },
    harvest: {
      bg: 'bg-amber-950/90',
      border: 'border-amber-800/50',
      text: 'text-amber-50',
      textSecondary: 'text-amber-300',
      accent: 'bg-amber-500/25',
      badgeBg: 'bg-amber-800/80',
      badgeBorder: 'border-amber-700/40',
      borderL: 'border-l-amber-500'
    },
    coastal: {
      bg: 'bg-cyan-950/90',
      border: 'border-cyan-800/50',
      text: 'text-cyan-50',
      textSecondary: 'text-cyan-300',
      accent: 'bg-cyan-500/25',
      badgeBg: 'bg-cyan-800/80',
      badgeBorder: 'border-cyan-700/40',
      borderL: 'border-l-cyan-500'
    },
    grill: {
      bg: 'bg-orange-950/90',
      border: 'border-orange-800/50',
      text: 'text-orange-50',
      textSecondary: 'text-orange-300',
      accent: 'bg-orange-500/25',
      badgeBg: 'bg-orange-800/80',
      badgeBorder: 'border-orange-700/40',
      borderL: 'border-l-orange-500'
    },
    midnight: {
      bg: 'bg-slate-950/90',
      border: 'border-slate-700/50',
      text: 'text-slate-100',
      textSecondary: 'text-slate-400',
      accent: 'bg-slate-500/25',
      badgeBg: 'bg-slate-800/80',
      badgeBorder: 'border-slate-700/40',
      borderL: 'border-l-slate-500'
    }
  };
  return themeColors[theme] || themeColors.fresh;
};

// Food-based nav colors
const getThemeNavColors = (theme) => {
  const themeNavColors = {
    fresh: { headerText: 'text-emerald-100', headerSecondary: 'text-emerald-300', navActive: 'text-emerald-400', navActiveBg: 'bg-emerald-500/25', navInactive: 'text-emerald-300/80', navHover: 'hover:text-emerald-200', border: 'border-emerald-800/40', navBadgeBg: 'bg-emerald-800/80', navBadgeBorder: 'border-emerald-700/40' },
    spice: { headerText: 'text-red-100', headerSecondary: 'text-red-300', navActive: 'text-red-400', navActiveBg: 'bg-red-500/25', navInactive: 'text-red-300/80', navHover: 'hover:text-red-200', border: 'border-red-800/40', navBadgeBg: 'bg-red-800/80', navBadgeBorder: 'border-red-700/40' },
    harvest: { headerText: 'text-amber-100', headerSecondary: 'text-amber-300', navActive: 'text-amber-400', navActiveBg: 'bg-amber-500/25', navInactive: 'text-amber-300/80', navHover: 'hover:text-amber-200', border: 'border-amber-800/40', navBadgeBg: 'bg-amber-800/80', navBadgeBorder: 'border-amber-700/40' },
    coastal: { headerText: 'text-cyan-100', headerSecondary: 'text-cyan-300', navActive: 'text-cyan-400', navActiveBg: 'bg-cyan-500/25', navInactive: 'text-cyan-300/80', navHover: 'hover:text-cyan-200', border: 'border-cyan-800/40', navBadgeBg: 'bg-cyan-800/80', navBadgeBorder: 'border-cyan-700/40' },
    grill: { headerText: 'text-orange-100', headerSecondary: 'text-orange-300', navActive: 'text-orange-400', navActiveBg: 'bg-orange-500/25', navInactive: 'text-orange-300/80', navHover: 'hover:text-orange-200', border: 'border-orange-800/40', navBadgeBg: 'bg-orange-800/80', navBadgeBorder: 'border-orange-700/40' },
    midnight: { headerText: 'text-slate-100', headerSecondary: 'text-slate-400', navActive: 'text-slate-300', navActiveBg: 'bg-slate-500/25', navInactive: 'text-slate-400', navHover: 'hover:text-slate-200', border: 'border-slate-700/40', navBadgeBg: 'bg-slate-800/80', navBadgeBorder: 'border-slate-700/40' }
  };
  return themeNavColors[theme] || themeNavColors.fresh;
};

// Food-theme accent RGB (PillNav, etc.)
const THEME_ACCENT_RGB = {
  fresh: [52, 211, 153],
  spice: [248, 113, 113],
  harvest: [251, 191, 36],
  coastal: [34, 211, 238],
  grill: [251, 146, 60],
  midnight: [148, 163, 184]
};

// Theme bg RGB for DarkVeil overlay & Card transparency
const THEME_BG_RGB = {
  fresh: [2, 44, 34],
  spice: [69, 10, 10],
  harvest: [69, 26, 3],
  coastal: [8, 51, 68],
  grill: [67, 20, 7],
  midnight: [2, 6, 23]
};
const getThemeBgRgba = (theme, opacity = APP_CONFIG.CARD_TRANSPARENCY) => {
  const [r, g, b] = THEME_BG_RGB[theme] || THEME_BG_RGB.fresh;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
const getThemeOverlayRgba = (theme, opacity = 0.2) => {
  const [r, g, b] = THEME_BG_RGB[theme] || THEME_BG_RGB.fresh;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
const getThemeAccentRgba = (theme, opacity = 0.2) => {
  const [r, g, b] = THEME_ACCENT_RGB[theme] || THEME_ACCENT_RGB.fresh;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
      className="relative rounded-xl shadow-md will-change-[height] transition-all duration-400"
      style={{
        backgroundColor: `rgba(15, 23, 42, ${Math.max(0.9, transparency)})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        height: isExpanded ? '420px' : '60px',
        minHeight: '60px',
        overflow: 'hidden',
        transition: 'height 0.4s ease',
        border: '1px solid rgba(71, 85, 105, 0.5)',
        zIndex: 50,
        position: 'relative'
      }}
    >
      <div className="absolute inset-x-0 top-0 h-[60px] flex items-center justify-between p-2 pl-[1.1rem] z-[100]">
        <div
          className={`hamburger-menu group h-full flex flex-col items-center justify-center cursor-pointer gap-[6px] order-2 md:order-none relative ${themeColors.headerText}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu();
          }}
          role="button"
          aria-label={isExpanded ? 'Close menu' : 'Open menu'}
          tabIndex={0}
          style={{ zIndex: 101, pointerEvents: 'auto' }}
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

        <div className="flex items-center gap-2 order-3 relative" style={{ zIndex: 200 }}>
          <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
          <span className={`text-xs font-medium ${themeColors.headerSecondary} ${themeColors.navBadgeBg || 'bg-slate-800/80'} backdrop-blur-sm px-2 py-1 rounded-full hidden md:block border ${themeColors.navBadgeBorder || 'border-slate-600/30'}`}>
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
        className={`absolute left-0 right-0 top-[60px] bottom-0 p-2 flex flex-col items-stretch gap-2 justify-start transition-opacity duration-300 ease-out md:flex-row md:items-end md:gap-[12px] ${
          isExpanded ? 'visible pointer-events-auto opacity-100' : 'invisible pointer-events-none opacity-0'
        }`}
        style={{
          zIndex: 110,
          position: 'absolute',
          width: '100%',
          left: 0,
          right: 0,
          top: '60px',
          bottom: 0
        }}
        aria-hidden={!isExpanded}
      >
        {(items || []).slice(0, 3).map((item, idx) => (
          <div
            key={`${item.label}-${idx}`}
            className="nav-card select-none relative flex flex-col gap-2 p-[12px_16px] rounded-[calc(0.75rem-0.2rem)] min-w-0 flex-[1_1_auto] h-auto min-h-[60px] md:h-full md:min-h-0 md:flex-[1_1_0%] transition-all duration-300 transform translate-y-0 opacity-100"
            style={{ 
              backgroundColor: item.bgColor || 'rgba(30, 41, 59, 0.95)', 
              color: item.textColor || '#e2e8f0'
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
  blur,
  currentTheme
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef([]);
  const themeAccentRgba = getThemeAccentRgba(currentTheme || DEFAULT_THEME, 0.2);

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
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`
            }}
      >
        <div
          className="relative items-center rounded-full hidden md:flex"
          style={{
            height: '42px',
            background: 'rgba(30, 41, 59, 0.9)',
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
                        ? 'rgba(51, 65, 85, 0.9)' 
                        : 'rgba(30, 41, 59, 0.6)'
                    }}
                    onMouseEnter={() => handlePillHover(i, true)}
                    onMouseLeave={() => handlePillHover(i, false)}
                    aria-label={item.label}
                  >
                    <span
                      className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none transition-transform duration-300"
                      style={{
                        width: '100px',
                        height: '100px',
                        transform: 'translateX(-50%) scale(0)',
                        transformOrigin: '50% bottom',
                        backgroundColor: themeAccentRgba
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
          className="md:hidden rounded-full border border-slate-600/40 flex flex-col items-center justify-center gap-1 cursor-pointer p-0 relative"
          style={{
            width: '42px',
            height: '42px',
            background: 'rgba(30, 41, 59, 0.9)'
          }}
        >
          <span
            className={`hamburger-line w-4 h-0.5 rounded origin-center transition-all duration-300 bg-slate-400 ${
              isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''
            }`}
          />
          <span
            className={`hamburger-line w-4 h-0.5 rounded origin-center transition-all duration-300 bg-slate-400 ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''
            }`}
          />
        </button>
      </nav>

      <div
        className={`md:hidden absolute bottom-[3.5em] left-4 right-4 rounded-[27px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] border ${themeColors.border} z-[998] origin-top transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'
        }`}
        style={{
          background: 'rgba(15, 23, 42, 0.98)',
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
                    ? 'rgba(51, 65, 85, 0.9)' 
                    : 'rgba(30, 41, 59, 0.6)'
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
    secondary: { bg: "rgba(15, 23, 42, 0.95)", glare: "#475569", text: "text-slate-200 border border-slate-600/50" },
    danger: { bg: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)", glare: "#f87171", text: "text-red-300" },
    ghost: { bg: "transparent", glare: "#64748b", text: "text-slate-300" },
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
      primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-900/50",
      secondary: "bg-slate-900/90 backdrop-blur-sm text-slate-200 border border-slate-600/50 hover:bg-slate-800 shadow-sm",
      danger: "bg-red-950/80 text-red-300 hover:bg-red-900/80 border border-red-900/50",
      ghost: "text-slate-300 hover:bg-slate-800/80 bg-transparent",
      success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-900/50"
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
    {label && <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>}
    <input
      className="w-full px-4 py-3 rounded-xl border border-slate-600/40 bg-slate-900/80 backdrop-blur-sm text-slate-100 placeholder:text-slate-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-slate-500 outline-none transition-all"
      {...props}
    />
  </div>
);
const Card = ({ children, className = "", transparency, theme }) => {
  const t = transparency ?? APP_CONFIG.CARD_TRANSPARENCY;
  const colors = theme ? getThemeCardColors(theme) : null;
  const base = "backdrop-blur-lg p-4 rounded-2xl shadow-lg";
  const themeClasses = colors ? `${colors.border} border` : "border border-slate-700/40";
  const style = colors
    ? { backgroundColor: getThemeBgRgba(theme, t) }
    : { backgroundColor: `rgba(15, 23, 42, ${t})` };
  return (
    <div className={`${base} ${themeClasses} ${className}`} style={style}>
      {children}
    </div>
  );
};


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
      {/* Theme overlay – follows current theme */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: getThemeOverlayRgba(currentTheme, 0.3) }} aria-hidden="true" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-slate-200 mb-4 shadow-xl border border-slate-700/40">
            <Utensils size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Campus Eats</h1>
          <p className="text-slate-300 mt-2">Ordering food made simple</p>
        </div>

        <Card theme={currentTheme} className="p-6 md:p-8">
          <div className="flex gap-2 p-1 bg-slate-800/80 rounded-xl mb-6 border border-slate-700/40">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? "bg-slate-700 text-indigo-300 shadow-sm" : "text-slate-400 hover:text-slate-300"}`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? "bg-slate-700 text-indigo-300 shadow-sm" : "text-slate-400 hover:text-slate-300"}`}
            >
              Sign Up
            </button>
          </div>

          <h2 className="text-xl font-semibold mb-6 text-slate-100">
            {isLogin ? `Welcome back, ${role === "student" ? "Student" : role === "staff" ? "Staff" : "Admin"}!` : `Create ${role === "student" ? "Student" : role === "staff" ? "Staff" : "Admin"} Account`}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && role === "admin" && (
              <Input
                label="Admin Key"
                type="password"
                placeholder="Enter admin key"
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

            {error && <div className="p-3 rounded-lg bg-red-950/60 backdrop-blur-sm text-red-300 text-sm flex items-center gap-2 border border-red-900/50"><ArrowRight size={14}/> {error}</div>}

            <Button disabled={loading} type="submit" className="w-full">
              {loading ? "Processing..." : (isLogin ? "Log In" : "Create Account")}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700/50">
             <Button variant="secondary" onClick={handleGoogle} className="w-full">
                {isLogin ? "Log in with Google" : "Sign up with Google"}
             </Button>
          </div>
        </Card>

        <button
          onClick={() => { setStep("role"); setRole(null); }}
          className="w-full mt-6 text-sm text-slate-400 hover:text-slate-200 font-medium"
        >
          ← Change Role
        </button>
      </div>
    </div>
  );
};

// --- Profile Creation (for student/staff after signup) ---
const ProfileCreation = ({ user, onComplete, currentTheme, onThemeChange, role }) => {
  const [profileData, setProfileData] = useState({
    name: "",
    branch: "",
    semester: "",
    batch: "",
    rollNumber: "",
    phone: "",
    gmail: user.email || "",
    photoUrl: ""
  });

  const [photoUploading, setPhotoUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const uploadPhoto = async (file) => {
    if (!file?.type?.startsWith("image/")) return;
    setPhotoUploading(true);
    try {
      const path = `profiles/${user.uid}_${Date.now()}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProfileData(p => ({ ...p, photoUrl: url }));
    } catch (e) {
      console.error(e);
      setError("Photo upload failed");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ FIXED VALIDATION (gmail removed)
    if (
      !profileData.name ||
      !profileData.phone ||
      !profileData.rollNumber ||
      !profileData.branch ||
      !profileData.semester ||
      !profileData.batch
    ) {
      setError("All fields are mandatory except photo");
      return;
    }

    setLoading(true);
    try {
      await setDoc(doc(db, "artifacts", APP_ID, "users", user.uid), {
        ...profileData,
        gmail: user.email, // ✅ authoritative source
        approved: false,
        role,
        email: user.email,
        createdAt: new Date().toISOString()
      });
      onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tc = getThemeCardColors(currentTheme);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <DarkVeil theme={currentTheme} />
      </div>
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: getThemeOverlayRgba(currentTheme, 0.2) }}
        aria-hidden="true"
      />

      <div className="absolute top-4 right-4 z-20">
        <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <h1 className={`text-3xl font-bold ${tc.text} mb-2 text-center`}>
          Complete Your Profile
        </h1>
        <p className={`text-center ${tc.textSecondary} mb-6`}>
          All fields are mandatory for approval
        </p>

        <Card theme={currentTheme} className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center">
              <label htmlFor="photo" className="cursor-pointer inline-block">
                <div
                  className={`w-20 h-20 rounded-full mx-auto mb-2 overflow-hidden flex items-center justify-center ${tc.badgeBg} border ${tc.badgeBorder}`}
                >
                  {profileData.photoUrl ? (
                    <img
                      src={profileData.photoUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={32} className={tc.text} />
                  )}
                </div>
              </label>

              <input
                id="photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) uploadPhoto(f);
                  e.target.value = "";
                }}
              />

              <p className={`text-xs ${tc.textSecondary}`}>
                {photoUploading ? "Uploading..." : "Click to add photo (Optional)"}
              </p>
            </div>

            <Input
              label="Full Name *"
              value={profileData.name}
              onChange={e => setProfileData({ ...profileData, name: e.target.value })}
            />

            <Input
              label="Gmail"
              type="email"
              value={profileData.gmail}
              disabled
              className="opacity-70 cursor-not-allowed"
            />

            <Input
              label="University Roll Number *"
              value={profileData.rollNumber}
              onChange={e => setProfileData({ ...profileData, rollNumber: e.target.value })}
            />

            <Input
              label="Branch *"
              value={profileData.branch}
              onChange={e => setProfileData({ ...profileData, branch: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Semester *"
                value={profileData.semester}
                onChange={e => setProfileData({ ...profileData, semester: e.target.value })}
              />
              <Input
                label="Batch *"
                value={profileData.batch}
                onChange={e => setProfileData({ ...profileData, batch: e.target.value })}
              />
            </div>

            <Input
              label="Phone *"
              value={profileData.phone}
              onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
            />

            {error && (
              <div className="p-3 rounded-lg text-red-300 text-sm flex items-center gap-2 border border-red-900/50">
                <ArrowRight size={14} /> {error}
              </div>
            )}

            <Button
              disabled={loading || photoUploading}
              type="submit"
              className="w-full"
            >
              {loading ? "Submitting..." : "Submit for Approval"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};


// --- Approval Pending ---
const ApprovalPending = ({ currentTheme, onThemeChange, logout }) => {
  const tc = getThemeCardColors(currentTheme);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <DarkVeil theme={currentTheme} />
      </div>
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: getThemeOverlayRgba(currentTheme, 0.2) }} aria-hidden="true" />
      
      <div className="absolute top-4 right-4 z-20">
        <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        <div className={`w-24 h-24 ${tc.accent} rounded-full mx-auto mb-6 flex items-center justify-center`}>
          <Clock size={48} className={tc.text} />
        </div>
        <h1 className={`text-3xl font-bold ${tc.text} mb-2`}>Awaiting Approval</h1>
        <p className={`${tc.textSecondary} mb-4`}>Your account has been submitted for verification. The admin will review your profile and send you an approval within 24-48 hours.</p>
        
        <Card theme={currentTheme} className="p-6 space-y-4">
          <div className={`flex items-center gap-3 ${tc.badgeBg} p-3 rounded-lg border ${tc.badgeBorder}`}>
            <CheckCircle size={20} className="text-emerald-400" />
            <span className={tc.text}>Profile submitted successfully</span>
          </div>
          <p className={`text-sm ${tc.textSecondary}`}>Once approved, you'll receive an email notification and can access all features.</p>
          <Button onClick={logout} className="w-full" variant="secondary">Logout</Button>
        </Card>
      </div>
    </div>
  );
};

// --- Admin App ---
const AdminApp = ({ logout, currentTheme, onThemeChange, users, orders, menu, inventory, onUpdateUser, onDeleteUser, onAddInventory, onUpdateInventory, onDeleteInventory, userProfile, updateUserProfile }) => {
  const [activeTab, setActiveTab] = useState("student_req");
  const [stockForm, setStockForm] = useState({ name: "", quantity: "", unit: "kg" });
  const [profileForm, setProfileForm] = useState({ name: "", dept: "", role: "admin" });

  useEffect(() => {
    if (userProfile) setProfileForm({ ...userProfile, dept: userProfile.dept || "", role: userProfile.role || "admin" });
  }, [userProfile]);
  
  const tc = getThemeCardColors(currentTheme);
  const navColors = getThemeNavColors(currentTheme);

  const pendingStudents = users.filter(u => u.role === "student" && !u.approved);
  const pendingStaff = users.filter(u => u.role === "staff" && !u.approved);
  
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  const handleAddStock = () => {
    if (!stockForm.name || !stockForm.quantity) return;
    onAddInventory({ ...stockForm, quantity: Number(stockForm.quantity) });
    setStockForm({ name: "", quantity: "", unit: "kg" });
  };

  const handleUpdateStockQty = (item, delta) => {
    const newQty = Math.max(0, (item.quantity || 0) + delta);
    onUpdateInventory(item.docId, { quantity: newQty });
  };

  const cardNavItems = [
    {
      label: "System",
      bgColor: `rgba(168, 85, 247, 0.9)`,
      textColor: "#fff",
      links: [
        { label: "Profile", onClick: () => setActiveTab("profile") },
        { label: "Settings", onClick: () => setActiveTab("settings") },
        { label: "Help", onClick: () => setActiveTab("help") },
        { label: "About", onClick: () => setActiveTab("about") }
      ]
    }
  ];

  const pillNavItems = [
    { id: "student_req", label: "Students", badge: pendingStudents.length },
    { id: "staff_req", label: "Staff", badge: pendingStaff.length },
    { id: "revenue", label: "Revenue" },
    { id: "menu_view", label: "Menu" },
    { id: "stock", label: "Stock" }
  ];

  const LogoComponent = (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
        <Settings size={16} />
      </div>
      <h1 className={`font-bold ${navColors.headerText} text-lg`}>Admin Panel</h1>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <DarkVeil theme={currentTheme} />
      </div>
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: getThemeOverlayRgba(currentTheme, 0.2) }} aria-hidden="true" />

      <div className="sticky top-4 z-50 px-4 pointer-events-auto">
        <CardNav
          logo={LogoComponent}
          items={cardNavItems}
          currentTheme={currentTheme}
          onThemeChange={onThemeChange}
          userProfile={userProfile}
          onLogout={logout}
          themeColors={navColors}
          transparency={0.2}
          blur={10}
        />
      </div>

      <main className="flex-1 p-4 overflow-y-auto pb-24 relative z-10">
        {/* STUDENT REQUESTS */}
        {activeTab === "student_req" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className={`text-2xl font-bold ${tc.text} drop-shadow-lg`}>Student Requests</h2>
            {pendingStudents.length === 0 ? (
              <div className={`text-center py-10 ${tc.textSecondary}`}>No pending student requests</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingStudents.map(u => (
                  <Card key={u.uid} theme={currentTheme} className="space-y-3">
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-full overflow-hidden ${tc.badgeBg} border ${tc.badgeBorder} flex items-center justify-center`}>
                        {u.photoUrl ? <img src={u.photoUrl} className="w-full h-full object-cover" alt="" /> : <User className={tc.text} />}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold ${tc.text}`}>{u.name}</h3>
                        <p className={`text-sm ${tc.textSecondary}`}>{u.rollNumber} • {u.branch}</p>
                        <p className={`text-xs ${tc.textSecondary}`}>{u.semester} Sem • {u.batch}</p>
                      </div>
                    </div>
                    <div className={`grid grid-cols-2 gap-2 text-xs ${tc.textSecondary} bg-black/20 p-2 rounded-lg`}>
                      <span>📧 {u.gmail}</span>
                      <span>📱 {u.phone}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="secondary" className="flex-1 bg-red-500/20 text-red-300 hover:bg-red-500/30 border-red-500/40" onClick={() => onDeleteUser(u.uid)}>Reject</Button>
                      <Button className="flex-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-emerald-500/40" onClick={() => onUpdateUser(u.uid, { approved: true })}>Approve</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STAFF REQUESTS */}
        {activeTab === "staff_req" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className={`text-2xl font-bold ${tc.text} drop-shadow-lg`}>Staff Requests</h2>
            {pendingStaff.length === 0 ? (
              <div className={`text-center py-10 ${tc.textSecondary}`}>No pending staff requests</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingStaff.map(u => (
                  <Card key={u.uid} theme={currentTheme} className="space-y-3">
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-full overflow-hidden ${tc.badgeBg} border ${tc.badgeBorder} flex items-center justify-center`}>
                        {u.photoUrl ? <img src={u.photoUrl} className="w-full h-full object-cover" alt="" /> : <ChefHat className={tc.text} />}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold ${tc.text}`}>{u.name}</h3>
                        <p className={`text-sm ${tc.textSecondary}`}>{u.email}</p>
                        <p className={`text-xs ${tc.textSecondary}`}>{u.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="secondary" className="flex-1 bg-red-500/20 text-red-300 hover:bg-red-500/30 border-red-500/40" onClick={() => onDeleteUser(u.uid)}>Reject</Button>
                      <Button className="flex-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-emerald-500/40" onClick={() => onUpdateUser(u.uid, { approved: true })}>Approve</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVENUE */}
        {activeTab === "revenue" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className={`text-2xl font-bold ${tc.text} drop-shadow-lg`}>Revenue Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card theme={currentTheme} className={`flex items-center gap-4 border-l-4 ${tc.borderL}`}>
                <div className={`p-3 ${tc.accent} ${tc.text} rounded-full`}><CreditCard size={24} /></div>
                <div>
                  <p className={`text-sm ${tc.textSecondary}`}>Total Revenue</p>
                  <p className={`text-2xl font-bold ${tc.text}`}>{formatCurrency(totalRevenue)}</p>
                </div>
              </Card>
              <Card theme={currentTheme} className={`flex items-center gap-4 border-l-4 ${tc.borderL}`}>
                <div className={`p-3 ${tc.accent} ${tc.text} rounded-full`}><ShoppingBag size={24} /></div>
                <div>
                  <p className={`text-sm ${tc.textSecondary}`}>Total Orders</p>
                  <p className={`text-2xl font-bold ${tc.text}`}>{orders.length}</p>
                </div>
              </Card>
            </div>
            {/* Recent Transactions List */}
            <Card theme={currentTheme} className="p-4">
              <h3 className={`font-bold ${tc.text} mb-4`}>Recent Transactions</h3>
              <div className="space-y-2">
                {orders.sort((a,b) => b.timestamp - a.timestamp).slice(0, 10).map(o => (
                  <div key={o.orderId} className={`flex justify-between items-center p-3 rounded-lg bg-black/20 border ${tc.border}`}>
                    <div>
                      <p className={`font-bold ${tc.text}`}>{o.studentName}</p>
                      <p className={`text-xs ${tc.textSecondary}`}>{new Date(o.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tc.text}`}>{formatCurrency(o.totalAmount)}</p>
                      <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${o.paymentMethod === 'cash' ? 'bg-orange-500/20 text-orange-300' : 'bg-emerald-500/20 text-emerald-300'}`}>{o.paymentMethod}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* MENU MONITORING */}
        {activeTab === "menu_view" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className={`text-2xl font-bold ${tc.text} drop-shadow-lg`}>Campus Menu Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menu.map(item => (
                <Card key={item.docId || item.id} theme={currentTheme} className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className={`w-12 h-12 rounded-lg overflow-hidden border ${tc.badgeBorder} flex items-center justify-center bg-slate-800/50`}>
                      {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">{item.image || "🍲"}</span>}
                    </div>
                    <span className={`text-sm font-bold ${tc.text} ${tc.badgeBg} px-2 py-1 rounded border ${tc.badgeBorder}`}>
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                  <div>
                    <h3 className={`font-bold ${tc.text}`}>{item.name}</h3>
                    <p className={`text-xs ${tc.textSecondary} line-clamp-1`}>{item.category}</p>
                    {item.foodType && (
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        item.foodType === "veg" ? "bg-emerald-500/20 text-emerald-400" : item.foodType === "egg" ? "bg-amber-500/20 text-amber-400" : "bg-orange-500/20 text-orange-400"
                      }`}>
                        {item.foodType}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
              {menu.length === 0 && <div className={`col-span-full text-center py-10 ${tc.textSecondary}`}>No menu items available</div>}
            </div>
          </div>
        )}

        {/* STOCK */}
        {activeTab === "stock" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className={`text-2xl font-bold ${tc.text} drop-shadow-lg`}>Stock Management</h2>
            
            {/* Add Stock Form */}
            <Card theme={currentTheme} className="p-4">
              <h3 className={`font-bold ${tc.text} mb-3`}>Add New Item</h3>
              <div className="flex gap-2">
                <input type="text" placeholder="Item Name" value={stockForm.name} onChange={e => setStockForm({...stockForm, name: e.target.value})} className={`flex-[2] px-3 py-2 rounded-lg bg-slate-900/60 border ${tc.border} ${tc.text} outline-none`} />
                <input type="number" placeholder="Qty" value={stockForm.quantity} onChange={e => setStockForm({...stockForm, quantity: e.target.value})} className={`flex-1 px-3 py-2 rounded-lg bg-slate-900/60 border ${tc.border} ${tc.text} outline-none`} />
                <select value={stockForm.unit} onChange={e => setStockForm({...stockForm, unit: e.target.value})} className={`flex-1 px-3 py-2 rounded-lg bg-slate-900/60 border ${tc.border} ${tc.text} outline-none`}>
                  <option value="kg">kg</option>
                  <option value="L">L</option>
                  <option value="pcs">pcs</option>
                  <option value="pkts">pkts</option>
                </select>
                <Button onClick={handleAddStock}>Add</Button>
              </div>
            </Card>

            {/* Inventory List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inventory.map(item => (
                <Card key={item.docId} theme={currentTheme} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tc.badgeBg} ${tc.text}`}><Package size={20}/></div>
                    <div>
                      <h4 className={`font-bold ${tc.text}`}>{item.name}</h4>
                      <p className={`text-sm ${tc.textSecondary}`}>{item.quantity} {item.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleUpdateStockQty(item, -1)} className={`p-1.5 rounded-lg ${tc.badgeBg} ${tc.text} hover:opacity-80`}><Minus size={14}/></button>
                    <button onClick={() => handleUpdateStockQty(item, 1)} className={`p-1.5 rounded-lg ${tc.badgeBg} ${tc.text} hover:opacity-80`}><Plus size={14}/></button>
                    <button onClick={() => onDeleteInventory(item.docId)} className="text-red-400 hover:bg-red-500/20 p-2 rounded-lg transition-colors ml-1"><Trash2 size={18}/></button>
                  </div>
                </Card>
              ))}
              {inventory.length === 0 && <div className={`col-span-full text-center py-8 ${tc.textSecondary}`}>No stock items added</div>}
            </div>
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto p-4">
            <h2 className={`text-2xl font-bold ${tc.text} drop-shadow-lg mb-6`}>Admin Profile</h2>
            <Card theme={currentTheme} className="space-y-4">
              <div className="flex justify-center mb-4">
                 <div className={`w-20 h-20 ${tc.badgeBg} backdrop-blur-sm ${tc.text} rounded-full flex items-center justify-center text-2xl font-bold border ${tc.badgeBorder}`}>
                    {profileForm.name ? profileForm.name[0].toUpperCase() : <User />}
                 </div>
              </div>
              <Input 
                label="Name" 
                value={profileForm.name} 
                onChange={e => setProfileForm({...profileForm, name: e.target.value})} 
              />
              <Input 
                label="Department" 
                value={profileForm.dept} 
                onChange={e => setProfileForm({...profileForm, dept: e.target.value})} 
              />
              <Input 
                label="Role" 
                value={profileForm.role} 
                disabled
                className="opacity-70 cursor-not-allowed"
              />
              <div className="pt-4">
                <Button onClick={() => updateUserProfile(profileForm)} className="w-full">
                  Save Changes
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* SETTINGS / HELP / ABOUT (Simple placeholders reusing StudentApp style) */}
        {["settings", "help", "about"].includes(activeTab) && (
          <div className="max-w-2xl mx-auto p-4">
             <Card theme={currentTheme} className="p-6 text-center">
               <h2 className={`text-2xl font-bold ${tc.text} mb-4 capitalize`}>{activeTab}</h2>
               <p className={tc.textSecondary}>Admin {activeTab} content goes here.</p>
               {activeTab === "about" && <p className={`mt-4 ${tc.text}`}>{APP_CONFIG.ABOUT_TEAM}</p>}
             </Card>
          </div>
        )}

      </main>

      <PillNav
        items={pillNavItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        themeColors={navColors}
        transparency={0.2}
        blur={10}
        currentTheme={currentTheme}
      />
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
  const [walletBalance, setWalletBalance] = useState(() => Number(localStorage.getItem("campuseats-wallet") || 0));
  const [upiAccounts, setUpiAccounts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("campuseats-upi") || "[]"); } catch { return []; }
  });
  const [newUpi, setNewUpi] = useState("");
  const [tabVisibility, setTabVisibility] = useState(() => {
    try {
      const v = JSON.parse(localStorage.getItem("campuseats-tabs") || "{}");
      return { menu: true, cart: true, orders: true, profile: true, settings: true, help: true, about: true, ...v };
    } catch { return { menu: true, cart: true, orders: true, profile: true, settings: true, help: true, about: true }; }
  });
  const [favourites, setFavourites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("campuseats-favourites") || "[]"); } catch { return []; }
  });
  const [menuMode, setMenuMode] = useState("all"); // 'all' | 'veg' | 'nonveg' | 'egg' | 'favourites'
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null); // 'cash' | 'prepaid'

  const favId = (item) => item.docId || item.id;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (userProfile) setProfileForm(userProfile);
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("campuseats-wallet", String(walletBalance));
  }, [walletBalance]);
  useEffect(() => {
    localStorage.setItem("campuseats-tabs", JSON.stringify(tabVisibility));
  }, [tabVisibility]);
  useEffect(() => {
    localStorage.setItem("campuseats-favourites", JSON.stringify(favourites));
  }, [favourites]);
  useEffect(() => {
    localStorage.setItem("campuseats-upi", JSON.stringify(upiAccounts));
  }, [upiAccounts]);

  const toggleFavourite = (id) => {
    setFavourites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const isFavourite = (item) => favourites.includes(favId(item));

  const addItem = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const cartId = (i) => i.docId || i.id;
  const removeItem = (itemId) => {
    setCart(prev => prev.filter(i => cartId(i) !== itemId));
  };

  const updateQty = (itemId, delta) => {
    setCart(prev => prev.map(i => {
      if (cartId(i) === itemId) return { ...i, qty: Math.max(1, i.qty + delta) };
      return i;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const handleCheckoutClick = () => {
    if (!profileForm.name || !profileForm.studentId) {
      alert("Please complete your profile first!");
      setActiveTab("profile");
      return;
    }
    if (cart.length === 0) return;
    setPaymentModalOpen(true);
  };

  const handlePlaceOrder = (paymentMethod) => {
    if (!paymentMethod) return;
    addToOrder({
      orderId: generateOrderId(),
      items: cart,
      totalAmount: cartTotal,
      studentUid: user.uid,
      studentName: profileForm.name,
      orderStatus: "Placed",
      paymentStatus: "Paid",
      paymentMethod, // 'cash' | 'prepaid'
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    });
    setCart([]);
    setPaymentModalOpen(false);
    setSelectedPayment(null);
    setActiveTab("orders");
  };

  const filteredMenu = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    const ft = item.foodType ?? (item.isVeg === true ? "veg" : item.isVeg === false ? "nonveg" : null);
    if (menuMode === "veg") return ft === "veg";
    if (menuMode === "nonveg") return ft === "nonveg";
    if (menuMode === "egg") return ft === "egg";
    if (menuMode === "favourites") return favourites.includes(favId(item));
    return true;
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* DarkVeil Background - pointer-events: none so they never block header clicks */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <DarkVeil theme={currentTheme} />
      </div>
      {/* Theme overlay – follows current theme */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: getThemeOverlayRgba(currentTheme, 0.2) }} aria-hidden="true" />

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
              { label: "Settings", ariaLabel: "Settings", onClick: () => setActiveTab("settings") }
            ]
          },
          {
            label: "Help",
            bgColor: `rgba(139, 92, 246, 0.9)`,
            textColor: "#fff",
            links: [
              { label: "Support", ariaLabel: "Get Support", onClick: () => setActiveTab("help") },
              { label: "About", ariaLabel: "About Campus Eats", onClick: () => setActiveTab("about") }
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
  className="sticky top-4 z-50 px-4 pointer-events-auto"
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
        style={activeTab === "menu" ? { overflow: 'hidden' } : { overflowY: 'auto', paddingBottom: '6rem' } }
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-600/40 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "all", label: "All" },
                      { id: "veg", label: "Veg" },
                      { id: "nonveg", label: "Non-veg" },
                      { id: "egg", label: "Egg" },
                      { id: "favourites", label: "Favourites" }
                    ].map(m => (
                      <button key={m.id} type="button"
                        onClick={() => setMenuMode(m.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          menuMode === m.id ? "bg-indigo-500/40 text-indigo-200 border border-indigo-500/50" : "bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:bg-slate-700/80"
                        }`}
                      >
                        {m.id === "favourites" && <Heart size={14} className="inline mr-1 align-middle" fill={menuMode === "favourites" ? "currentColor" : "none"} />}
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMenu.map(item => (
                      <Card 
                        key={item.docId || item.id} 
                        theme={currentTheme}
                        className="flex flex-col gap-3 hover:shadow-xl transition-all duration-300 relative"
                      >
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleFavourite(favId(item)); }}
                          className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors z-10 ${isFavourite(item) ? "text-red-400" : "text-slate-500 hover:text-red-400"}`}
                          aria-label={isFavourite(item) ? "Remove from favourites" : "Add to favourites"}
                        >
                          <Heart size={18} fill={isFavourite(item) ? "currentColor" : "none"} />
                        </button>
                        <div className="flex justify-between items-start">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden text-2xl ${item.color || themeColors.badgeBg} border ${themeColors.badgeBorder}`}>
                            {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : <span>{item.image || "🍲"}</span>}
                          </div>
                          <span className={`text-sm font-semibold ${themeColors.text} ${themeColors.badgeBg} px-2 py-1 rounded-md border ${themeColors.badgeBorder}`}>
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                        <div>
                          <h3 className={`font-bold ${themeColors.text}`}>{item.name}</h3>
                          <p className={`text-xs ${themeColors.textSecondary} line-clamp-2 mt-1`}>{item.desc}</p>
                          {(() => {
                            const ft = item.foodType ?? (item.isVeg === true ? "veg" : item.isVeg === false ? "nonveg" : null);
                            if (!ft) return null;
                            return (
                              <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded ${
                                ft === "veg" ? "bg-green-500/20 text-green-400" : ft === "egg" ? "bg-amber-500/20 text-amber-400" : "bg-orange-500/20 text-orange-400"
                              }`}>
                                {ft === "veg" ? "Veg" : ft === "egg" ? "Egg" : "Non-veg"}
                              </span>
                            );
                          })()}
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
                    {filteredMenu.length === 0 && (
                      <div className="col-span-full text-center py-12 text-slate-400">
                        {menuMode === "favourites" ? "No favourites yet. Tap the heart on menu items." : menu.length === 0 ? "No menu items. Staff can add items." : "No items match your filters."}
                      </div>
                    )}
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
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
                <ShoppingBag size={64} strokeWidth={1} />
                <p>Your cart is empty</p>
                <Button variant="ghost" onClick={() => setActiveTab("menu")} noGlare>Browse Menu</Button>
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                {(() => {
                  const tc = getThemeCardColors(currentTheme);
                  return cart.map(item => (
                    <div key={cartId(item)} className={`${tc.bg} backdrop-blur-md p-4 rounded-xl border ${tc.border} flex items-center gap-4 shadow-lg`}>
                      <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-slate-800/60">
                        {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">{item.image || "🍲"}</span>}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${tc.text}`}>{item.name}</h4>
                        <p className={`text-sm ${tc.textSecondary}`}>{formatCurrency(item.price)}</p>
                      </div>
                      <div className={`flex items-center gap-3 ${tc.badgeBg} rounded-lg p-1 border ${tc.badgeBorder}`}>
                        <button type="button" onClick={() => updateQty(cartId(item), -1)} className={`p-1 hover:opacity-80 rounded-md transition-opacity ${tc.text}`}><Minus size={14}/></button>
                        <span className={`text-sm font-medium w-4 text-center ${tc.text}`}>{item.qty}</span>
                        <button type="button" onClick={() => updateQty(cartId(item), 1)} className={`p-1 hover:opacity-80 rounded-md transition-opacity ${tc.text}`}><Plus size={14}/></button>
                      </div>
                      <button type="button" onClick={() => removeItem(cartId(item))} className={`${tc.textSecondary} hover:text-red-400 p-2 transition-colors`}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ));
                })()}
                
                <Card theme={currentTheme} className="mt-8 p-6 space-y-4">
                  {(() => {
                    const tc = getThemeCardColors(currentTheme);
                    return (
                      <>
                        <div className={`flex justify-between ${tc.textSecondary}`}>
                          <span>Subtotal</span>
                          <span>{formatCurrency(cartTotal)}</span>
                        </div>
                        <div className={`flex justify-between font-bold text-xl ${tc.text} pt-4 border-t ${tc.border}`}>
                          <span>Total</span>
                          <span>{formatCurrency(cartTotal)}</span>
                        </div>
                        <Button onClick={handleCheckoutClick} className="w-full">
                          Checkout
                        </Button>
                      </>
                    );
                  })()}
                </Card>

                {/* Suggestions in checkout area */}
                {cart.length > 0 && (() => {
                  const tc = getThemeCardColors(currentTheme);
                  const inCartIds = cart.map(i => cartId(i));
                  const suggestions = menu.filter(m => !inCartIds.includes(cartId(m))).slice(0, 4);
                  if (suggestions.length === 0) return null;
                  return (
                    <Card theme={currentTheme} className="mt-4 p-4">
                      <h4 className={`font-bold ${tc.text} mb-3`}>You might also like</h4>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {suggestions.map(s => (
                          <button key={cartId(s)} type="button" onClick={() => addItem(s)} className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border ${tc.border} ${tc.badgeBg} hover:opacity-90 transition-opacity`}>
                            <span className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-slate-800/60">
                              {s.imageUrl ? <img src={s.imageUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">{s.image || "🍲"}</span>}
                            </span>
                            <span className={`text-sm font-medium ${tc.text} whitespace-nowrap`}>{s.name}</span>
                            <span className={`text-xs ${tc.textSecondary}`}>{formatCurrency(s.price)}</span>
                          </button>
                        ))}
                      </div>
                    </Card>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Payment method modal */}
        {paymentModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-950/98 rounded-2xl p-6 max-w-sm w-full border border-slate-700/50 shadow-xl">
              <h3 className="text-xl font-bold text-slate-100 mb-2">Select payment method</h3>
              <p className="text-sm text-slate-400 mb-4">How will you pay for this order?</p>
              <div className="flex gap-3 mb-6">
                <button type="button" onClick={() => setSelectedPayment("cash")}
                  className={`flex-1 py-4 rounded-xl border-2 font-medium transition-all ${selectedPayment === "cash" ? "border-orange-500 bg-orange-500/20 text-orange-300" : "border-slate-600 text-slate-400 hover:border-orange-500/50"}`}>
                  Cash
                </button>
                <button type="button" onClick={() => setSelectedPayment("prepaid")}
                  className={`flex-1 py-4 rounded-xl border-2 font-medium transition-all ${selectedPayment === "prepaid" ? "border-emerald-500 bg-emerald-500/20 text-emerald-300" : "border-slate-600 text-slate-400 hover:border-emerald-500/50"}`}>
                  Prepaid
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" noGlare className="flex-1" onClick={() => { setPaymentModalOpen(false); setSelectedPayment(null); }}>Cancel</Button>
                <Button className="flex-1" onClick={() => handlePlaceOrder(selectedPayment)} disabled={!selectedPayment}>Place Order</Button>
              </div>
            </div>
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
                
                const tc = getThemeCardColors(currentTheme);
                return (
                  <Card key={order.orderId} theme={currentTheme} className={`overflow-hidden border-l-4 ${order.orderStatus === 'Served' ? 'border-l-emerald-500 opacity-90' : tc.borderL}`}>
                    {order.orderStatus === "Placed" && (() => {
                      const isCash = order.paymentMethod === "cash";
                      return (
                      <div className={`${isCash ? "bg-orange-500/20 border-orange-500/50" : "bg-emerald-500/20 border-emerald-500/50"} backdrop-blur-sm -m-4 mb-4 p-6 flex flex-col items-center justify-center text-center border-b ${isCash ? "border-orange-500/40" : "border-emerald-500/40"}`}>
                        <div className={`${isCash ? "bg-orange-500/30 border-orange-500/50" : "bg-emerald-500/30 border-emerald-500/50"} backdrop-blur-sm p-2 rounded-xl mb-3 shadow-lg border`}>
                          <QrCode size={80} className={isCash ? "text-orange-200" : "text-emerald-200"} />
                        </div>
                        <p className={`text-xs font-bold ${tc.textSecondary} uppercase tracking-widest mb-1`}>Pickup Code</p>
                        <h3 className={`text-4xl font-black ${tc.text} tracking-wider font-mono`}>{pickupCode}</h3>
                        <p className={`text-xs ${tc.textSecondary} mt-2`}>{isCash ? "Cash • " : "Prepaid • "}Show this code to staff</p>
                      </div>
                      );
                    })()}
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold ${tc.text}`}>Order #{pickupCode}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${tc.badgeBg} ${tc.text} border ${tc.badgeBorder}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className={`text-xs ${tc.textSecondary} mt-1`}>{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <span className={`font-bold ${tc.text}`}>{formatCurrency(order.totalAmount)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className={`flex justify-between text-sm ${tc.textSecondary} border-b ${tc.border} last:border-0 pb-2 last:pb-0`}>
                          <span>{item.qty}x {item.name}</span>
                          <span>{formatCurrency(item.price * item.qty)}</span>
                        </div>
                      ))}
                    </div>
                    
                    {order.orderStatus === "Served" && (
                      <div className={`mt-4 pt-3 border-t ${tc.border} text-center`}>
                        <p className={`text-xs ${tc.text} font-medium flex items-center justify-center gap-1`}>
                          <CheckCircle size={12}/> Order Picked Up
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })}
              
              {orders.filter(o => o.studentUid === user.uid).length === 0 && (
                 <div className="text-center text-slate-400 py-10">No orders yet</div>
              )}
            </div>
          </div>
        )}

        {/* PROFILE VIEW */}
        {activeTab === "profile" && (
          <div className="p-4 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-6">My Profile</h2>
            <Card theme={currentTheme} className="space-y-4">
              {(() => {
                const tc = getThemeCardColors(currentTheme);
                return (
                  <>
              <div className="flex justify-center mb-4">
                 <div className={`w-20 h-20 ${tc.badgeBg} backdrop-blur-sm ${tc.text} rounded-full flex items-center justify-center text-2xl font-bold border ${tc.badgeBorder}`}>
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
                  </>
                );
              })()}
            </Card>
          </div>
        )}

        {/* SETTINGS VIEW */}
        {activeTab === "settings" && (() => {
          const tc = getThemeCardColors(currentTheme);
          return (
          <div className="p-4 max-w-2xl mx-auto">
            <h2 className={`text-2xl font-bold drop-shadow-lg mb-6 ${tc.text}`}>Settings</h2>
            <div className="space-y-6">
              <Card theme={currentTheme} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Wallet className={`w-8 h-8 ${tc.accent} ${tc.text} rounded-full p-1.5`} />
                  <h3 className={`font-bold text-lg ${tc.text}`}>Wallet Management</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className={tc.textSecondary}>Balance</span>
                  <span className={`font-bold text-lg ${tc.text}`}>{formatCurrency(walletBalance)}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" noGlare onClick={() => setWalletBalance(w => w + 100)}>Add ₹100</Button>
                </div>
              </Card>
              <Card theme={currentTheme} className="space-y-4">
                <div className="flex items-center gap-3">
                  <CreditCard className={`w-8 h-8 ${tc.accent} ${tc.text} rounded-full p-1.5`} />
                  <h3 className={`font-bold text-lg ${tc.text}`}>UPI Accounts</h3>
                </div>
                <p className={`text-sm ${tc.textSecondary}`}>Add UPI IDs for prepaid payments.</p>
                <div className="flex gap-2">
                  <input type="text" placeholder="e.g. name@upi" value={newUpi} onChange={e => setNewUpi(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && newUpi.trim()) { setUpiAccounts(prev => [...prev, newUpi.trim()]); setNewUpi(""); } }}
                    className={`flex-1 px-4 py-3 rounded-xl border ${tc.border} bg-slate-900/60 ${tc.text} placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none`} />
                  <Button variant="secondary" noGlare onClick={() => { if (newUpi.trim()) { setUpiAccounts(prev => [...prev, newUpi.trim()]); setNewUpi(""); } }}>Add</Button>
                </div>
                <ul className="space-y-2">
                  {upiAccounts.map((id, i) => (
                    <li key={i} className={`flex items-center justify-between ${tc.badgeBg} ${tc.text} px-3 py-2 rounded-lg border ${tc.badgeBorder}`}>
                      <span className="font-mono text-sm">{id}</span>
                      <button type="button" onClick={() => setUpiAccounts(prev => prev.filter((_, j) => j !== i))} className={`${tc.textSecondary} hover:text-red-400`}><X size={16}/></button>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card theme={currentTheme} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Settings className={`w-8 h-8 ${tc.accent} ${tc.text} rounded-full p-1.5`} />
                  <h3 className={`font-bold text-lg ${tc.text}`}>Tab Navigation</h3>
                </div>
                <p className={`text-sm ${tc.textSecondary}`}>Choose which tabs appear in the bottom bar.</p>
                <div className="flex flex-col gap-2">
                  {["menu", "cart", "orders", "profile", "settings", "help", "about"].map(tab => (
                    <label key={tab} className={`flex items-center justify-between gap-2 cursor-pointer ${tc.text}`}>
                      <span className="capitalize">{tab}</span>
                      <input type="checkbox" checked={!!tabVisibility[tab]} onChange={() => setTabVisibility(prev => ({ ...prev, [tab]: !prev[tab] }))} className="rounded" />
                    </label>
                  ))}
                </div>
              </Card>
            </div>
          </div>
          );
        })()}

        {/* HELP VIEW */}
        {activeTab === "help" && (() => {
          const tc = getThemeCardColors(currentTheme);
          return (
          <div className="p-4 max-w-2xl mx-auto">
            <h2 className={`text-2xl font-bold drop-shadow-lg mb-6 ${tc.text}`}>Help & Support</h2>
            <Card theme={currentTheme} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${tc.accent} ${tc.text}`}><HelpCircle className="w-6 h-6" /></div>
                <h3 className={`font-bold text-lg ${tc.text}`}>Contact</h3>
              </div>
              <div>
                <p className={`text-sm ${tc.textSecondary} mb-1`}>Phone</p>
                <a href={`tel:${APP_CONFIG.HELP_PHONE}`} className={`font-medium ${tc.text} hover:underline`}>{APP_CONFIG.HELP_PHONE}</a>
              </div>
              <div>
                <p className={`text-sm ${tc.textSecondary} mb-1`}>Email</p>
                <a href={`mailto:${APP_CONFIG.HELP_EMAIL}`} className={`font-medium ${tc.text} hover:underline`}>{APP_CONFIG.HELP_EMAIL}</a>
              </div>
            </Card>
          </div>
          );
        })()}

        {/* ABOUT VIEW */}
        {activeTab === "about" && (() => {
          const tc = getThemeCardColors(currentTheme);
          return (
          <div className="p-4 max-w-2xl mx-auto">
            <h2 className={`text-2xl font-bold drop-shadow-lg mb-6 ${tc.text}`}>About</h2>
            <Card theme={currentTheme} className="space-y-6 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className={`p-2 rounded-full ${tc.accent} ${tc.text}`}><Info className="w-6 h-6" /></div>
                <h3 className={`font-bold text-lg ${tc.text}`}>Campus Eats</h3>
              </div>
              <p className={tc.textSecondary}>{APP_CONFIG.ABOUT_TEAM}</p>
            </Card>
          </div>
          );
        })()}
      </main>

      {/* Bottom Navigation - PillNav Style */}
      {(() => {
        const navColors = getThemeNavColors(currentTheme);
        const pillNavItems = [
          { id: "menu", label: "Menu" },
          { id: "cart", label: "Cart", badge: cartCount },
          { id: "orders", label: "Orders" },
          { id: "profile", label: "Profile" },
          { id: "settings", label: "Settings" },
          { id: "help", label: "Help" },
          { id: "about", label: "About" }
        ].filter(item => tabVisibility[item.id] !== false);
        
        return (
          <PillNav
            items={pillNavItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            themeColors={navColors}
            transparency={NAV_TRANSPARENCY}
            blur={NAV_BLUR}
            currentTheme={currentTheme}
          />
        );
      })()}
    </div>
  );
};

// --- Staff App ---
const StaffApp = ({ orders, updateOrder, logout, menu, categories, onUpdateMenu, onDeleteMenu, onAddMenu, onClearMenu, onAddCategory, onDeleteCategory, currentTheme, onThemeChange }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filter, setFilter] = useState("Placed");
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [menuForm, setMenuForm] = useState({ name: "", price: "", category: "", desc: "", image: "🍲", imageUrl: "", foodType: "veg" });
  const [editingItemId, setEditingItemId] = useState(null);
  const [categoryInput, setCategoryInput] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef(null);

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

  const uploadMenuImage = async (file) => {
    if (!file?.type?.startsWith("image/")) {
      alert("Please select a valid image file");
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }
    setImageUploading(true);
    try {
      const path = `menu/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setMenuForm((f) => ({ ...f, imageUrl: url }));
      if (imageInputRef.current) imageInputRef.current.value = "";
    } catch (e) {
      console.error("Upload error:", e);
      alert("Image upload failed: " + (e.message || "Unknown error"));
    } finally {
      setImageUploading(false);
    }
  };

  const handleSaveMenu = () => {
    if (!menuForm.name || !menuForm.price) return alert("Name and Price required");
    const itemData = {
      name: menuForm.name,
      price: Number(menuForm.price),
      category: menuForm.category || "",
      desc: menuForm.desc || "",
      image: menuForm.image || "🍲",
      imageUrl: menuForm.imageUrl || null,
      foodType: menuForm.foodType || "veg",
      available: true
    };
    if (editingItemId) {
      onUpdateMenu(editingItemId, itemData);
    } else {
      onAddMenu({ ...itemData, id: Date.now() });
    }
    setIsEditingMenu(false);
    setMenuForm({ name: "", price: "", category: "", desc: "", image: "🍲", imageUrl: "", foodType: "veg" });
    setEditingItemId(null);
  };

  const openEditMenu = (item) => {
    setMenuForm({
      ...item,
      foodType: item.foodType || (item.isVeg === true ? "veg" : item.isVeg === false ? "nonveg" : "veg")
    });
    setEditingItemId(item.docId);
    setIsEditingMenu(true);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* DarkVeil Full Background */}
      <div className="fixed inset-0 z-0">
        <DarkVeil theme={currentTheme} />
      </div>
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: getThemeOverlayRgba(currentTheme, 0.2) }} aria-hidden="true" />

      <header className="relative z-10 text-slate-200 px-6 py-4 flex justify-between items-center shadow-md sticky top-0 bg-slate-950/95 backdrop-blur-md border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <ChefHat className="text-orange-400" />
          <div>
             <h1 className="font-bold text-lg leading-none">Kitchen Dashboard</h1>
             <p className="text-xs text-slate-400">Manage orders efficiently</p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
           <button 
             onClick={() => setActiveTab("dashboard")} 
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
           >
             Orders
           </button>
           <button 
             onClick={() => setActiveTab("menu")} 
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'menu' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
           >
             Menu
           </button>
           <button onClick={logout} className="ml-4 p-2 bg-slate-800/80 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700/40">
             <LogOut size={18}/>
           </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full relative z-10">
        {activeTab === "dashboard" && (
          <>
            {/* Stats Row */}
            {(() => {
              const tc = getThemeCardColors(currentTheme);
              return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card theme={currentTheme} className={`flex items-center gap-4 border-l-4 ${tc.borderL}`}>
                 <div className={`p-3 ${tc.accent} ${tc.text} rounded-full`}><Clock/></div>
                 <div>
                    <p className={`text-sm ${tc.textSecondary} font-medium`}>Pending Orders</p>
                    <p className={`text-2xl font-bold ${tc.text}`}>{stats.pending}</p>
                 </div>
              </Card>
              <Card theme={currentTheme} className="flex items-center gap-4 border-l-4 border-l-emerald-500">
                 <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-full"><CheckCircle/></div>
                 <div>
                    <p className={`text-sm ${tc.textSecondary} font-medium`}>Completed</p>
                    <p className={`text-2xl font-bold ${tc.text}`}>{stats.served}</p>
                 </div>
              </Card>
              <Card theme={currentTheme} className={`flex items-center gap-4 border-l-4 ${tc.borderL}`}>
                 <div className={`p-3 ${tc.accent} ${tc.text} rounded-full`}><CreditCard/></div>
                 <div>
                    <p className={`text-sm ${tc.textSecondary} font-medium`}>Total Revenue</p>
                    <p className={`text-2xl font-bold ${tc.text}`}>{formatCurrency(stats.revenue)}</p>
                 </div>
              </Card>
            </div>
              );
            })()}

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {["Placed", "Served", "All"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap ${
                    filter === f 
                    ? "bg-slate-700 text-slate-100 shadow-lg backdrop-blur-sm border border-slate-600/50" 
                    : "bg-slate-800/60 backdrop-blur-sm text-slate-400 hover:bg-slate-700/80 hover:text-slate-200 border border-slate-700/40"
                  }`}
                >
                  {f === "Placed" ? "Pending" : f}
                </button>
              ))}
            </div>

            {/* Orders Grid */}
            {(() => {
              const tc = getThemeCardColors(currentTheme);
              return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map(order => (
                <Card key={order.orderId} theme={currentTheme} className={`flex flex-col h-full hover:shadow-xl transition-all ${order.orderStatus === "Served" ? "opacity-75" : ""}`}>
                  <div className={`flex justify-between items-start mb-4 pb-4 border-b ${tc.border}`}>
                     <div>
                        {/* HIDE ORDER ID from Staff to force verification */}
                        <div className="flex items-center gap-2 mb-1">
                          <User size={16} className={tc.textSecondary}/>
                          <h3 className={`font-bold text-lg ${tc.text}`}>{order.studentName}</h3>
                          {order.paymentMethod === "cash" && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/30 text-orange-300 border border-orange-500/50 uppercase">Cash</span>}
                          {order.paymentMethod === "prepaid" && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 uppercase">Prepaid</span>}
                        </div>
                        <p className={`text-xs ${tc.textSecondary}`}>{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                     </div>
                     <div className="text-right">
                        <p className={`font-bold ${tc.text} ${tc.badgeBg} px-2 py-1 rounded border ${tc.badgeBorder}`}>{formatCurrency(order.totalAmount)}</p>
                     </div>
                  </div>

                  <div className="flex-1 space-y-3 mb-6">
                     {order.items.map((item, i) => (
                       <div key={i} className={`flex justify-between items-center text-sm ${tc.text}`}>
                          <div className="flex items-center gap-2">
                             <span className={`${tc.badgeBg} font-bold px-2 py-0.5 rounded text-xs border ${tc.badgeBorder}`}>{item.qty}x</span>
                             <span>{item.name}</span>
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
                    <div className="mt-auto text-center py-2 bg-emerald-500/20 text-emerald-400 rounded-lg font-medium text-sm flex items-center justify-center gap-2 border border-emerald-500/30">
                       <CheckCircle size={16}/> Served
                    </div>
                  )}
                </Card>
              ))}
              
              {filteredOrders.length === 0 && (
                 <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                    <Coffee size={48} className="mb-4 opacity-20"/>
                    <p>No orders found for this filter.</p>
                 </div>
              )}
            </div>
              );
            })()}
          </>
        )}

        {/* MENU MANAGEMENT TAB */}
        {activeTab === "menu" && (
          <div className="max-w-4xl mx-auto">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-white drop-shadow-lg">Menu Management</h2>
               <Button onClick={() => {
                 setMenuForm({ name: "", price: "", category: "", desc: "", image: "🍲", imageUrl: "", foodType: "veg" });
                 setEditingItemId(null);
                 setIsEditingMenu(true);
               }} className="gap-2">
                 <PlusCircle size={20}/> Add Item
               </Button>
               {onClearMenu && <button type="button" onClick={onClearMenu} className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium">Clear all menu</button>}
             </div>
             {/* Categories */}
             <Card theme={currentTheme} className="mb-6 p-4">
               {(() => {
                 const tc = getThemeCardColors(currentTheme);
                 return (
                   <div className="space-y-3">
                     <h3 className={`font-bold ${tc.text}`}>Categories</h3>
                     <div className="flex flex-wrap gap-2">
                       <input type="text" placeholder="New category" value={categoryInput} onChange={e => setCategoryInput(e.target.value)}
                         onKeyDown={e => { if (e.key === "Enter") { onAddCategory?.(categoryInput); setCategoryInput(""); } }}
                         className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-600/40 text-slate-100 placeholder:text-slate-500 flex-1 min-w-[120px]" />
                       <Button variant="secondary" noGlare onClick={() => { onAddCategory?.(categoryInput); setCategoryInput(""); }}>Add</Button>
                     </div>
                     <div className="flex flex-wrap gap-2">
                       {categories.map(c => (
                         <span key={c.docId} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full ${tc.badgeBg} ${tc.text} border ${tc.badgeBorder} text-sm`}>
                           {c.name}
                           <button type="button" onClick={() => onDeleteCategory?.(c.docId)} className="text-red-400 hover:bg-red-500/20 rounded p-0.5" aria-label="Delete category"><X size={14}/></button>
                         </span>
                       ))}
                       {categories.length === 0 && <span className={`text-sm ${tc.textSecondary}`}>No categories. Add one above.</span>}
                     </div>
                   </div>
                 );
               })()}
             </Card>

             {(() => {
               const tc = getThemeCardColors(currentTheme);
               return (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {menu.map(item => (
                 <Card key={item.docId} theme={currentTheme} className="flex items-start gap-4">
                    <div className={`w-16 h-16 ${tc.badgeBg} rounded-lg flex items-center justify-center overflow-hidden border ${tc.badgeBorder}`}>
                      {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-3xl">{item.image || "🍲"}</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className={`font-bold ${tc.text}`}>{item.name}</h3>
                        <span className={`font-medium ${tc.textSecondary}`}>{formatCurrency(item.price)}</span>
                      </div>
                      <p className={`text-sm ${tc.textSecondary} mb-2`}>{item.category}</p>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => openEditMenu(item)} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors">
                          <Edit size={16}/>
                        </button>
                        <button type="button" onClick={() => onDeleteMenu(item.docId)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" aria-label="Delete item">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>
                 </Card>
               ))}
             </div>
               );
             })()}
          </div>
        )}
      </main>

      {/* VERIFICATION MODAL */}
      {verifyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950/98 backdrop-blur-xl rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 border border-slate-700/50">
             <div className="text-center mb-6">
               <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400 border border-slate-700/40">
                 <QrCode size={32}/>
               </div>
               <h3 className="text-xl font-bold text-slate-100">Verify Order</h3>
               <p className="text-sm text-slate-400 mt-2">Enter the 4-digit code shown on the student's device.</p>
             </div>
             
             <input
               autoFocus
               type="text" 
               maxLength={4}
               placeholder="0000"
               className="w-full text-center text-3xl tracking-[1em] font-mono font-bold border-b-2 border-slate-600 focus:border-indigo-500 outline-none py-4 mb-6 bg-transparent text-slate-100 placeholder:text-slate-500"
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
          <div className="bg-slate-950/98 backdrop-blur-xl rounded-2xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh] border border-slate-700/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-100">{editingItemId ? "Edit Item" : "New Item"}</h3>
              <button onClick={() => setIsEditingMenu(false)} className="text-slate-400 hover:text-slate-200"><X/></button>
            </div>
            
            <div className="space-y-4">
              <Input label="Item Name" value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Price (₹)" type="number" value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Category</label>
                  <select value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-600/40 bg-slate-900/80 text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">— Select —</option>
                    {categories.map(c => <option key={c.docId} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <Input label="Description" value={menuForm.desc} onChange={e => setMenuForm({...menuForm, desc: e.target.value})} />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Food image</label>
                <div className="flex gap-2 items-center">
                  <input type="file" accept="image/*" className="hidden" id="menu-img" ref={imageInputRef} onChange={e => { const f = e.target.files?.[0]; if (f) uploadMenuImage(f); }} />
                  <label htmlFor="menu-img" className="flex-1 px-4 py-3 rounded-xl border border-slate-600/40 bg-slate-800/60 text-slate-300 text-center cursor-pointer hover:bg-slate-700/80 transition-colors">
                    {imageUploading ? "Uploading…" : menuForm.imageUrl ? "Change image" : "Upload image"}
                  </label>
                  {menuForm.imageUrl && <button type="button" onClick={() => setMenuForm({...menuForm, imageUrl: ""})} className="px-3 py-2 text-red-400 hover:bg-red-500/20 rounded-lg">Remove</button>}
                </div>
                {menuForm.imageUrl && <img src={menuForm.imageUrl} alt="" className="h-20 w-20 object-cover rounded-lg border border-slate-600/40" />}
                <Input label="Emoji fallback" placeholder="🍲" value={menuForm.image} onChange={e => setMenuForm({...menuForm, image: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Veg / Non-veg / Egg</label>
                <div className="flex gap-2">
                  {(["veg", "nonveg", "egg"]).map(t => (
                    <button key={t} type="button" onClick={() => setMenuForm({...menuForm, foodType: t})}
                      className={`flex-1 py-3 rounded-xl border font-medium transition-all ${
                        menuForm.foodType === t ? (t === "veg" ? "bg-emerald-500/30 border-emerald-500/50 text-emerald-300" : t === "egg" ? "bg-amber-500/30 border-amber-500/50 text-amber-300" : "bg-orange-500/30 border-orange-500/50 text-orange-300")
                        : "border-slate-600/40 text-slate-400 hover:border-slate-500"
                      }`}>
                      {t === "veg" ? "Veg" : t === "egg" ? "Egg" : "Non-veg"}
                    </button>
                  ))}
                </div>
              </div>
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
  const ThemeIcon = THEME_ICONS[currentTheme] || THEME_ICONS.fresh;

  const buttonClass = variant === "dark" 
    ? "p-2 bg-slate-800/80 backdrop-blur-sm rounded-lg text-slate-200 hover:bg-slate-700 transition-all flex items-center gap-2 border border-slate-600/40"
    : "p-2 bg-slate-900/90 backdrop-blur-sm rounded-lg text-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2 border border-slate-600/40";

  const dropdown = isOpen && createPortal(
    <>
      <div 
        className="fixed inset-0 z-[9998]" 
        style={{ background: 'transparent' }}
        onClick={() => setIsOpen(false)} 
        aria-hidden="true"
      />
      <div
        className="fixed right-4 top-[72px] bg-slate-950/98 backdrop-blur-md rounded-xl shadow-xl border border-slate-700/50 p-2 z-[9999] min-w-[180px]"
        onClick={(e) => e.stopPropagation()}
      >
        {Object.keys(THEMES).map(theme => {
          const Icon = THEME_ICONS[theme] || THEME_ICONS.fresh;
          return (
            <button
              key={theme}
              type="button"
              onClick={() => {
                onThemeChange(theme);
                setIsOpen(false);
              }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                    currentTheme === theme
                      ? 'bg-indigo-500/30 text-indigo-200'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
            >
              <Icon size={18} />
              <span className="font-medium capitalize">{theme}</span>
            </button>
          );
        })}
      </div>
    </>,
    document.body
  );

  return (
    <div className="relative">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)} 
        className={buttonClass}
      >
        <ThemeIcon size={18} />
        <span className="text-xs font-medium capitalize hidden sm:inline">{currentTheme}</span>
      </button>
      {dropdown}
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
    {/* Theme overlay – follows current theme */}
    <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: getThemeOverlayRgba(currentTheme, 0.2) }} aria-hidden="true" />

    {/* Theme Selector - Top Right */}
    <div className="absolute top-4 right-4 z-20">
      <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
    </div>

    <div className="relative z-10">
      <div className="text-center mb-10 animate-in slide-in-from-top-10 fade-in duration-700">
         <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">Campus Eats</h1>
         <p className="text-lg text-slate-300">Choose your portal to continue</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
         <GlareHover
           width="100%"
           height="auto"
           background="rgba(15,23,42,0.95)"
           borderRadius="24px"
           borderColor="rgba(99,102,241,0.4)"
           glareColor="#6366f1"
           glareOpacity={0.2}
           glareAngle={-30}
           glareSize={300}
           transitionDuration={600}
           className="cursor-pointer backdrop-blur-md"
           style={{ minHeight: '220px' }}
         >
           <button type="button"
             onClick={() => onSelect("student")}
             className="w-full h-full p-8 flex flex-col items-center text-center gap-4"
           >
             <div className="w-20 h-20 bg-slate-800/80 backdrop-blur-sm text-indigo-400 rounded-2xl flex items-center justify-center mb-2 border border-slate-700/40">
                <User size={40} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-100">Student</h3>
                <p className="text-sm text-slate-400 mt-2">Browse menu, place orders, and track your food history.</p>
             </div>
           </button>
         </GlareHover>

         <GlareHover
           width="100%"
           height="auto"
           background="rgba(15,23,42,0.95)"
           borderRadius="24px"
           borderColor="rgba(249,115,22,0.4)"
           glareColor="#f97316"
           glareOpacity={0.2}
           glareAngle={-30}
           glareSize={300}
           transitionDuration={600}
           className="cursor-pointer backdrop-blur-md"
           style={{ minHeight: '220px' }}
         >
           <button type="button"
             onClick={() => onSelect("staff")}
             className="w-full h-full p-8 flex flex-col items-center text-center gap-4"
           >
             <div className="w-20 h-20 bg-slate-800/80 backdrop-blur-sm text-orange-400 rounded-2xl flex items-center justify-center mb-2 border border-slate-700/40">
                <ChefHat size={40} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-100">Canteen Staff</h3>
                <p className="text-sm text-slate-400 mt-2">Manage incoming orders, update status, and view sales.</p>
             </div>
           </button>
         </GlareHover>

         <GlareHover
           width="100%"
           height="auto"
           background="rgba(15,23,42,0.95)"
           borderRadius="24px"
           borderColor="rgba(168,85,247,0.4)"
           glareColor="#a855f7"
           glareOpacity={0.2}
           glareAngle={-30}
           glareSize={300}
           transitionDuration={600}
           className="cursor-pointer backdrop-blur-md"
           style={{ minHeight: '220px' }}
         >
           <button type="button"
             onClick={() => onSelect("admin")}
             className="w-full h-full p-8 flex flex-col items-center text-center gap-4"
           >
             <div className="w-20 h-20 bg-slate-800/80 backdrop-blur-sm text-purple-400 rounded-2xl flex items-center justify-center mb-2 border border-slate-700/40">
                <Settings size={40} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-100">Admin</h3>
                <p className="text-sm text-slate-400 mt-2">Manage users, revenue, and analytics.</p>
             </div>
           </button>
         </GlareHover>
      </div>
    </div>
  </div>
);

/* ================= MAIN CONTROLLER ================= */

export default function App() {
  const [step, setStep] = useState("role"); // role | auth | profile | app
  const [role, setRole] = useState(null); // student | staff | admin
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('campuseats-theme');
    return FOOD_THEME_KEYS.includes(saved) ? saved : DEFAULT_THEME;
  });

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('campuseats-theme', theme);
  };
  
  // Data State
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [inventory, setInventory] = useState([]);

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
          setRole(data.role);
          // Check approval status
          if (data.role === "admin" || data.approved === true) {
            setStep("app");
          } else {
            setStep("approval-pending");
          }
        } else {
          // User authenticated but no profile (mid-signup state)
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
    const unsubMenu = onSnapshot(menuRef, (snapshot) => {
      setMenu(snapshot.docs.map(d => ({ ...d.data(), docId: d.id })));
    });
    const unsubCat = onSnapshot(categoriesRef, (snapshot) => {
      setCategories(snapshot.docs.map(d => ({ ...d.data(), docId: d.id })));
    });

    if (!user) return () => { unsubMenu(); unsubCat(); };

    let unsubOrders = () => {};
    let unsubUsers = () => {};
    let unsubInventory = () => {};

    // Orders Listener - Scoped by role to prevent permission errors
    const ordersRef = collection(db, "artifacts", APP_ID, "public", "data", "orders");
    
    if (userProfile?.role === 'student' && user?.uid) {
      const q = query(ordersRef, where("studentUid", "==", user.uid));
      unsubOrders = onSnapshot(q, (snapshot) => {
        setOrders(snapshot.docs.map(d => ({ ...d.data(), docId: d.id })));
      }, (error) => console.log("Orders listener error:", error.code));
    } else if (userProfile?.role === 'staff' || userProfile?.role === 'admin') {
      // Staff and Admin see all orders
      unsubOrders = onSnapshot(ordersRef, (snapshot) => {
        setOrders(snapshot.docs.map(d => ({ ...d.data(), docId: d.id })));
      }, (error) => console.log("Orders listener error:", error.code));
    }

    // Admin-only Listeners
    if (userProfile?.role === 'admin') {
      unsubUsers = onSnapshot(usersRef, (snapshot) => {
        setAllUsers(snapshot.docs.map(d => ({ ...d.data(), uid: d.id })));
      }, (error) => console.log("Users listener error:", error.code));
      
      unsubInventory = onSnapshot(inventoryRef, (snapshot) => {
        setInventory(snapshot.docs.map(d => ({ ...d.data(), docId: d.id })));
      }, (error) => console.log("Inventory listener error:", error.code));
    }

    return () => { unsubMenu(); unsubCat(); unsubOrders(); unsubUsers(); unsubInventory(); };
  }, [user, userProfile]);

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
    // Admin requires master key; others don't
    if (role === "admin" && masterKey !== MASTER_KEY) throw new Error("Invalid Admin Key");
    
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
      name: "",
      provider: method,
      createdAt: new Date().toISOString(),
      approved: role === "admin" ? true : false
    };

    await setDoc(doc(db, "artifacts", APP_ID, "users", userCredential.user.uid), profileData);
    setUser(userCredential.user);
    // Redirect to profile creation for non-admin
    if (role !== "admin") {
      setStep("profile");
    } else {
      setUserProfile(profileData);
      setStep("app");
    }
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
    await addDoc(menuRef, item);
  };

  const handleClearAllMenu = async () => {
    if (!window.confirm("Delete ALL menu items? This cannot be undone.")) return;
    const snap = await getDocs(menuRef);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  };

  const handleAddCategory = async (name) => {
    if (!name?.trim()) return;
    await addDoc(categoriesRef, { name: name.trim() });
  };

  const handleDeleteCategory = async (docId) => {
    if (!docId) return;
    await deleteDoc(doc(categoriesRef, docId));
  };

  const handleUpdateMenuItem = async (docId, updates) => {
    const { docId: _d, ...rest } = updates;
    await updateDoc(doc(menuRef, docId), rest);
  };

  const handleDeleteMenuItem = async (docId) => {
    if (!docId || typeof docId !== "string") return;
    await deleteDoc(doc(menuRef, docId));
  };

  const updateUserProfile = async (data) => {
    if (!user) return;
    await setDoc(doc(db, "artifacts", APP_ID, "users", user.uid), data, { merge: true });
    setUserProfile(prev => ({ ...prev, ...data }));
  };

  // Admin Actions
  const handleUpdateUser = async (uid, data) => {
    await updateDoc(doc(db, "artifacts", APP_ID, "users", uid), data);
  };

  const handleDeleteUser = async (uid) => {
    await deleteDoc(doc(db, "artifacts", APP_ID, "users", uid));
  };

  // Inventory Actions
  const handleAddInventory = async (item) => {
    await addDoc(inventoryRef, item);
  };
  const handleUpdateInventory = async (docId, updates) => {
    await updateDoc(doc(inventoryRef, docId), updates);
  };
  const handleDeleteInventory = async (docId) => {
    await deleteDoc(doc(inventoryRef, docId));
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

  if (step === "profile" && user) {
    return (
      <ProfileCreation
        user={user}
        role={role}
        onComplete={() => {
          setStep("approval-pending");
        }}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />
    );
  }

  if (step === "approval-pending") {
    return (
      <ApprovalPending
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        logout={handleLogout}
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
    } else if (userProfile.role === "staff") {
      return (
        <StaffApp 
          orders={orders}
          menu={menu}
          categories={categories}
          updateOrder={updateOrder}
          onAddMenu={handleAddMenuItem}
          onUpdateMenu={handleUpdateMenuItem}
          onDeleteMenu={handleDeleteMenuItem}
          onClearMenu={handleClearAllMenu}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          logout={handleLogout}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      );
    } else if (userProfile.role === "admin") {
      return (
        <AdminApp
          logout={handleLogout}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          users={allUsers}
          orders={orders}
          menu={menu}
          inventory={inventory}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onAddInventory={handleAddInventory}
          onUpdateInventory={handleUpdateInventory}
          onDeleteInventory={handleDeleteInventory}
          userProfile={userProfile}
          updateUserProfile={updateUserProfile}
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
