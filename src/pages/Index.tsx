import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";

const REVIEWS_URL = "https://functions.poehali.dev/73e03e61-3546-48e8-93ad-f6e39067ea84";

interface Review {
  id: number;
  nickname: string;
  rating: number;
  text: string;
  created_at: string;
}

const NAV_ITEMS = [
  { label: "Главная", href: "#home" },
  { label: "О чите", href: "#about" },
  { label: "Функции", href: "#features" },
  { label: "Цены", href: "#pricing" },
  { label: "Скачать", href: "#download" },
  { label: "Отзывы", href: "#reviews" },
];

const FEATURES = [
  {
    icon: "Cpu",
    title: "Оптимизация под ПК",
    desc: "Автоматически подстраивается под мощность твоего железа — работает одинаково хорошо на слабых и мощных машинах.",
  },
  {
    icon: "Zap",
    title: "Низкое потребление",
    desc: "Минимальная нагрузка на CPU и RAM. Играй без лагов и просадок FPS даже при максимальных настройках.",
  },
  {
    icon: "Shield",
    title: "Стабильная работа",
    desc: "Никаких крашей и вылетов. Протестировано на сотнях конфигураций для надёжной работы 24/7.",
  },
  {
    icon: "Settings",
    title: "Гибкая настройка",
    desc: "Удобный интерфейс с горячими клавишами. Настрой каждый модуль под свой стиль игры.",
  },
  {
    icon: "Eye",
    title: "Обход анти-чит",
    desc: "Продвинутые методы обхода популярных анти-чит систем. Играй незаметно.",
  },
  {
    icon: "RefreshCw",
    title: "Частые обновления",
    desc: "Регулярные обновления после каждого патча Minecraft. Всегда актуальная версия.",
  },
];

const PLANS = [
  {
    name: "Collaps Client",
    price: "Бесплатно",
    period: "навсегда",
    features: ["Все модули", "Полный функционал", "Регулярные обновления", "Поддержка 1.8 — 1.21", "Низкое потребление ресурсов"],
    cta: "Скачать бесплатно",
    highlight: true,
  },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("visible"); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`section-reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [showThanksBanner, setShowThanksBanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeNav, setActiveNav] = useState("home");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewNick, setReviewNick] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const loadReviews = async () => {
    const res = await fetch(REVIEWS_URL);
    const data = await res.json();
    setReviews(data.reviews || []);
  };

  useEffect(() => { loadReviews(); }, []);

  const submitReview = async () => {
    if (!reviewNick.trim() || !reviewText.trim()) return;
    setReviewStatus("sending");
    const res = await fetch(REVIEWS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: reviewNick, rating: reviewRating, text: reviewText }),
    });
    if (res.ok) {
      setReviewStatus("done");
      setReviewNick("");
      setReviewText("");
      setReviewRating(5);
      loadReviews();
    } else {
      setReviewStatus("error");
    }
  };

  useEffect(() => {
    const onScroll = () => {
      const sections = ["home", "about", "features", "pricing", "download"];
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveNav(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadState("uploading");
    setUploadedFileName(file.name);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("https://functions.poehali.dev/6f1e726a-40ee-4b87-9ec7-586b34ad0412", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, fileData: base64, contentType: file.type || "application/octet-stream" }),
        });
        const data = await res.json();
        if (res.ok && data.url) {
          setDownloadUrl(data.url);
          setUploadState("done");
        } else {
          setUploadState("error");
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadState("error");
    }
  };

  return (
    <div className="min-h-screen bg-collaps-bg font-montserrat text-collaps-text relative overflow-x-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg pointer-events-none z-0 opacity-60" />

      {/* Glow orb */}
      <div className="fixed top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)" }} />

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-collaps-border"
        style={{ background: "rgba(7,8,13,0.85)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <a href="#home" className="font-black text-xl tracking-widest text-green glow-text-green font-mono">
            COLLAPS
          </a>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const id = item.href.replace("#", "");
              const isActive = activeNav === id;
              return (
                <a key={item.label} href={item.href}
                  className={`text-sm font-medium transition-colors duration-200 ${isActive ? "text-green" : "text-collaps-muted hover:text-collaps-text"}`}>
                  {item.label}
                </a>
              );
            })}
          </div>
          <a href="#download"
            className="hidden md:inline-flex items-center gap-2 bg-green text-collaps-bg font-bold text-sm px-5 py-2 rounded hover:bg-collaps-green-dim transition-all duration-200 animate-glow-pulse">
            <Icon name="Download" size={16} />
            Скачать
          </a>
          {/* Mobile burger */}
          <button className="md:hidden text-collaps-text" onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? "X" : "Menu"} size={24} />
          </button>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-collaps-border bg-collaps-surface px-6 py-4 flex flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <a key={item.label} href={item.href}
                className="text-sm font-medium text-collaps-muted hover:text-green transition-colors"
                onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16">
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-collaps-border rounded-full px-4 py-1.5 mb-8 text-xs font-mono text-collaps-muted animate-fade-in"
            style={{ animationDelay: "0ms" }}>
            <span className="w-2 h-2 rounded-full bg-green animate-pulse inline-block" />
            Версия 2.4 · Поддержка 1.8 — 1.21
          </div>

          <h1 className="font-black text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight mb-2 animate-fade-in"
            style={{ animationDelay: "100ms" }}>
            Добро пожаловать в
          </h1>
          <h1 className="font-black text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight mb-8 text-green glow-text-green animate-fade-in"
            style={{ animationDelay: "200ms" }}>
            CollapsCLIENT
          </h1>

          <p className="text-collaps-muted text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in"
            style={{ animationDelay: "300ms" }}>
            С этим софтом вы будете чувствовать себя сильнее, чем обычный игрок.
            Полный контроль над игрой — в твоих руках.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
            style={{ animationDelay: "400ms" }}>
            <a href="#download"
              className="flex items-center gap-2 bg-green text-collaps-bg font-bold text-base px-8 py-3.5 rounded transition-all duration-200 hover:shadow-[0_0_30px_rgba(57,255,132,0.4)] hover:scale-105">
              <Icon name="Download" size={18} />
              Скачать бесплатно
            </a>
            <a href="#features"
              className="flex items-center gap-2 border border-collaps-border text-collaps-text font-medium text-base px-8 py-3.5 rounded transition-all duration-200 hover:border-green hover:text-green">
              Возможности
              <Icon name="ArrowRight" size={18} />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 pt-16 border-t border-collaps-border animate-fade-in"
            style={{ animationDelay: "500ms" }}>
            {[["10К+", "Игроков"], ["99.9%", "Uptime"], ["1.8–1.21", "Версии MC"]].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="font-black text-2xl md:text-3xl text-green glow-text-green font-mono">{val}</div>
                <div className="text-xs text-collaps-muted mt-1 uppercase tracking-widest">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero image */}
        <div className="absolute inset-0 z-0 opacity-10">
          <img
            src="https://cdn.poehali.dev/projects/6bfafa50-3119-4001-961c-356d646450cf/files/0eea3d53-1ea6-4f81-9751-6304270b3df8.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <RevealSection>
            <div className="font-mono text-xs text-green tracking-widest uppercase mb-4">О чите</div>
            <h2 className="font-black text-4xl md:text-5xl leading-tight mb-6">
              Почувствуй разницу
            </h2>
            <p className="text-collaps-muted text-lg leading-relaxed mb-6">
              С Collaps вы будете чувствовать себя сильнее, чем обычный игрок.
              Больше возможностей, больше контроля, больше уверенности в каждом бою.
            </p>
            <p className="text-collaps-muted text-lg leading-relaxed mb-6">
              Пока другие тратят сотни часов на прокачку — ты уже на вершине.
              Collaps даёт реальное преимущество без потери FPS и стабильности игры.
            </p>
            <p className="text-collaps-muted text-lg leading-relaxed">
              Написан с нуля, протестирован тысячами игроков. Работает на любом железе — от старого ноутбука до топового ПК.
            </p>
          </RevealSection>

          <RevealSection delay={150}>
            <div className="border border-collaps-border rounded-xl p-8 bg-collaps-card font-mono text-sm leading-relaxed card-hover">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-green opacity-60" />
                <span className="ml-3 text-collaps-muted text-xs">collaps.log</span>
              </div>
              <div className="space-y-2">
                <div><span className="text-collaps-muted">[INFO]</span> <span className="text-green">Collaps</span> запускается...</div>
                <div><span className="text-collaps-muted">[INFO]</span> Загрузка модулей: <span className="text-green">OK</span></div>
                <div><span className="text-collaps-muted">[INFO]</span> Anti-cheat bypass: <span className="text-green">активен</span></div>
                <div><span className="text-collaps-muted">[INFO]</span> Потребление RAM: <span className="text-green">48 MB</span></div>
                <div><span className="text-collaps-muted">[INFO]</span> FPS: <span className="text-green">240</span> (было 180)</div>
                <div><span className="text-collaps-muted">[INFO]</span> Статус: <span className="text-green">готов к игре</span> ✓</div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <div className="font-mono text-xs text-green tracking-widest uppercase mb-4">Функции</div>
            <h2 className="font-black text-4xl md:text-5xl">Всё что нужно для победы</h2>
          </RevealSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <RevealSection key={f.title} delay={i * 80}>
                <div className="border border-collaps-border rounded-xl p-6 bg-collaps-card h-full card-hover">
                  <div className="w-10 h-10 rounded-lg bg-collaps-green-glow border border-green/20 flex items-center justify-center mb-4">
                    <Icon name={f.icon} size={20} className="text-green" fallback="Star" />
                  </div>
                  <h3 className="font-bold text-base mb-2">{f.title}</h3>
                  <p className="text-collaps-muted text-sm leading-relaxed">{f.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-32 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <RevealSection className="text-center mb-16">
            <div className="font-mono text-xs text-green tracking-widest uppercase mb-4">Цены</div>
            <h2 className="font-black text-4xl md:text-5xl">Полностью бесплатно</h2>
          </RevealSection>

          <div className="flex justify-center">
            {PLANS.map((plan, i) => (
              <RevealSection key={plan.name} delay={i * 100} className="w-full max-w-md">
                <div className={`relative border rounded-xl p-10 h-full flex flex-col transition-all duration-300 ${
                  plan.highlight
                    ? "border-green glow-green bg-collaps-card"
                    : "border-collaps-border bg-collaps-card card-hover"
                }`}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-green text-collaps-bg text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      100% бесплатно
                    </span>
                  </div>
                  <div className="mb-6">
                    <div className="font-mono text-xs text-collaps-muted uppercase tracking-widest mb-2">{plan.name}</div>
                    <div className="font-black text-4xl text-green">{plan.price}</div>
                    <div className="text-collaps-muted text-sm mt-1">{plan.period}</div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm text-collaps-text">
                        <Icon name="Check" size={16} className="text-green shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <div className="border border-collaps-border rounded-lg p-4 mb-6 bg-collaps-surface">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="Info" size={14} className="text-green shrink-0" />
                      <span className="font-mono text-xs text-green uppercase tracking-wider">Инструкция по установке</span>
                    </div>
                    <ol className="space-y-2 text-sm text-collaps-muted">
                      <li className="flex gap-2"><span className="text-green font-mono font-bold shrink-0">1.</span> Скачай и установи <span className="text-collaps-text font-medium mx-1">Legacy Launcher</span></li>
                      <li className="flex gap-2"><span className="text-green font-mono font-bold shrink-0">2.</span> В лаунчере выбери и скачай версию <span className="font-mono text-green mx-1">1.21.4 Fabric</span></li>
                      <li className="flex gap-2"><span className="text-green font-mono font-bold shrink-0">3.</span> Скачай файл чита ниже и закинь в папку <span className="font-mono text-collaps-text bg-collaps-bg px-1.5 py-0.5 rounded mx-1">.minecraft/mods</span></li>
                      <li className="flex gap-2"><span className="text-green font-mono font-bold shrink-0">4.</span> Запусти игру через профиль <span className="text-collaps-text font-medium mx-1">Fabric 1.21.4</span></li>
                    </ol>
                  </div>
                  <button className={`w-full py-3 rounded font-bold text-sm transition-all duration-200 ${
                    plan.highlight
                      ? "bg-green text-collaps-bg hover:shadow-[0_0_24px_rgba(57,255,132,0.4)] hover:scale-[1.02]"
                      : "border border-collaps-border text-collaps-text hover:border-green hover:text-green"
                  }`}>
                    {plan.cta}
                  </button>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* DOWNLOAD */}
      <section id="download" className="py-32 px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <RevealSection>
            <div className="font-mono text-xs text-green tracking-widest uppercase mb-4">Скачать</div>
            <h2 className="font-black text-4xl md:text-5xl mb-4">Загрузи чит</h2>
            <p className="text-collaps-muted mb-12">
              Нажми на зону ниже чтобы загрузить файл чита. После загрузки появится ссылка для скачивания.
            </p>

            <div
              onClick={() => uploadState === "idle" && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 transition-all duration-300 cursor-pointer ${
                uploadState === "idle"
                  ? "border-collaps-border hover:border-green hover:bg-collaps-green-glow"
                  : uploadState === "uploading"
                  ? "border-green/40 bg-collaps-green-glow animate-pulse"
                  : uploadState === "done"
                  ? "border-green bg-collaps-green-glow cursor-default"
                  : "border-red-500/40 cursor-pointer"
              }`}
            >
              {uploadState === "idle" && (
                <div>
                  <Icon name="Upload" size={48} className="text-green mx-auto mb-4 opacity-60" />
                  <div className="font-bold text-lg mb-2">Нажми чтобы выбрать файл</div>
                  <div className="text-collaps-muted text-sm">.jar, .zip, .exe и другие форматы</div>
                </div>
              )}
              {uploadState === "uploading" && (
                <div>
                  <Icon name="Loader" size={48} className="text-green mx-auto mb-4 animate-spin" />
                  <div className="font-bold text-lg mb-1">Загрузка...</div>
                  <div className="text-collaps-muted text-sm font-mono truncate">{uploadedFileName}</div>
                </div>
              )}
              {uploadState === "done" && (
                <div>
                  <Icon name="CheckCircle" size={48} className="text-green mx-auto mb-4" />
                  <div className="font-bold text-lg mb-2 text-green">Файл загружен!</div>
                  <div className="text-collaps-muted text-sm font-mono mb-6 truncate">{uploadedFileName}</div>
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-green text-collaps-bg font-bold px-6 py-3 rounded hover:shadow-[0_0_24px_rgba(57,255,132,0.4)] transition-all duration-200"
                    onClick={(e) => { e.stopPropagation(); setShowThanksBanner(true); }}
                  >
                    <Icon name="Download" size={18} />
                    Скачать файл
                  </a>
                </div>
              )}
              {uploadState === "error" && (
                <div>
                  <Icon name="AlertCircle" size={48} className="text-red-400 mx-auto mb-4" />
                  <div className="font-bold text-lg mb-2 text-red-400">Ошибка загрузки</div>
                  <div className="text-collaps-muted text-sm mb-4">Попробуй ещё раз</div>
                  <button
                    className="border border-collaps-border text-collaps-text px-4 py-2 rounded text-sm hover:border-green hover:text-green transition-colors"
                    onClick={(e) => { e.stopPropagation(); setUploadState("idle"); fileInputRef.current?.click(); }}
                  >
                    Повторить
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
          </RevealSection>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-32 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <RevealSection className="text-center mb-16">
            <div className="font-mono text-xs text-green tracking-widest uppercase mb-4">Отзывы</div>
            <h2 className="font-black text-4xl md:text-5xl">Что говорят игроки</h2>
          </RevealSection>

          {/* Форма */}
          <RevealSection className="mb-12">
            <div className="border border-collaps-border rounded-xl p-8 bg-collaps-card">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Icon name="MessageSquarePlus" size={20} className="text-green" />
                Оставить отзыв
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Твой ник"
                  maxLength={50}
                  value={reviewNick}
                  onChange={(e) => setReviewNick(e.target.value)}
                  className="bg-collaps-bg border border-collaps-border rounded-lg px-4 py-3 text-sm text-collaps-text placeholder:text-collaps-muted focus:outline-none focus:border-white transition-colors"
                />
                <div className="flex items-center gap-3">
                  <span className="text-collaps-muted text-sm shrink-0">Оценка:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setReviewRating(s)}>
                        <Icon
                          name="Star"
                          size={24}
                          className={`transition-colors ${s <= reviewRating ? "text-green" : "text-collaps-border"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <textarea
                placeholder="Напиши свой отзыв..."
                maxLength={1000}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="w-full bg-collaps-bg border border-collaps-border rounded-lg px-4 py-3 text-sm text-collaps-text placeholder:text-collaps-muted focus:outline-none focus:border-white transition-colors resize-none mb-4"
              />
              <div className="flex items-center gap-4">
                <button
                  onClick={submitReview}
                  disabled={reviewStatus === "sending" || !reviewNick.trim() || !reviewText.trim()}
                  className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {reviewStatus === "sending"
                    ? <><Icon name="Loader" size={16} className="animate-spin" />Отправка...</>
                    : <><Icon name="Send" size={16} />Отправить отзыв</>}
                </button>
                {reviewStatus === "done" && (
                  <span className="text-sm text-green flex items-center gap-1">
                    <Icon name="CheckCircle" size={16} /> Спасибо за отзыв!
                  </span>
                )}
                {reviewStatus === "error" && (
                  <span className="text-sm text-red-400">Ошибка, попробуй ещё раз</span>
                )}
              </div>
            </div>
          </RevealSection>

          {/* Список отзывов */}
          {reviews.length === 0 ? (
            <RevealSection>
              <div className="text-center text-collaps-muted py-12 border border-collaps-border rounded-xl">
                <Icon name="MessageSquare" size={40} className="mx-auto mb-3 opacity-30" />
                <p>Отзывов пока нет — будь первым!</p>
              </div>
            </RevealSection>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {reviews.map((r, i) => (
                <RevealSection key={r.id} delay={i * 60}>
                  <div className="border border-collaps-border rounded-xl p-6 bg-collaps-card card-hover h-full">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-collaps-border flex items-center justify-center font-bold text-xs text-green">
                          {r.nickname[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-sm">{r.nickname}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Icon key={s} name="Star" size={14}
                            className={s <= r.rating ? "text-green" : "text-collaps-border"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-collaps-muted text-sm leading-relaxed">{r.text}</p>
                  </div>
                </RevealSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      {/* THANKS POPUP */}
      {showThanksBanner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: "rgba(7,8,13,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowThanksBanner(false)}
        >
          <div
            className="relative border border-green rounded-2xl p-10 max-w-md w-full text-center glow-green bg-collaps-card animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-collaps-muted hover:text-green transition-colors"
              onClick={() => setShowThanksBanner(false)}
            >
              <Icon name="X" size={20} />
            </button>
            <div className="text-5xl mb-5">🎉</div>
            <h2 className="font-black text-2xl md:text-3xl leading-snug mb-4">
              Опа, вот и скачался<br />
              <span className="text-green glow-text-green">лучший фри софт!</span>
            </h2>
            <p className="text-collaps-muted mb-8 leading-relaxed">
              Оставь отзыв — это помогает другим игрокам узнать о Collaps и мотивирует нас делать его лучше.
            </p>
            <a
              href="#reviews"
              className="inline-flex items-center gap-2 bg-green text-collaps-bg font-bold px-7 py-3 rounded hover:shadow-[0_0_24px_rgba(57,255,132,0.4)] hover:scale-105 transition-all duration-200"
              onClick={() => setShowThanksBanner(false)}
            >
              <Icon name="Star" size={18} />
              Оставить отзыв
            </a>
            <div className="mt-4">
              <button
                className="text-collaps-muted text-sm hover:text-collaps-text transition-colors"
                onClick={() => setShowThanksBanner(false)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-collaps-border py-10 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-black text-lg tracking-widest text-green font-mono">COLLAPS</div>
          <div className="text-collaps-muted text-sm">© 2024 Collaps Client. Все права защищены.</div>
          <div className="flex items-center gap-6 text-sm text-collaps-muted">
            {NAV_ITEMS.map((item) => (
              <a key={item.label} href={item.href} className="hover:text-green transition-colors">
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}