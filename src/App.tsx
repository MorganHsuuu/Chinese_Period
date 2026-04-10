import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Wind, 
  Sparkles, 
  Heart, 
  Activity, 
  ChevronRight, 
  RefreshCw,
  Info,
  MapPin,
  Zap,
  Droplets,
  Flame,
  Trees,
  Mountain
} from 'lucide-react';
import { getLunarInfo, type LunarInfo } from './lib/lunarUtils';
import { cn } from './lib/utils';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lunarInfo, setLunarInfo] = useState<LunarInfo>(getLunarInfo());
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<string>("平常");
  const [history, setHistory] = useState<{time: string, meridian: string, feeling: string}[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('qi_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Update time and lunar info every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setLunarInfo(getLunarInfo(now));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleStartRitual = async () => {
    if (!process.env.GEMINI_API_KEY) {
      setInsight("時光流轉，順應自然即是智慧。目前無法取得詳細指引（未設定 API Key），請靜心感受當下。");
      setIsInitialized(true);
      return;
    }
    setIsLoading(true);
    try {
      const prompt = `
        你是一位精通中國傳統文化、農民曆、天干地支與中醫五行的現代導師。
        現在的時間資訊如下：
        - 農曆：${lunarInfo.lunarDate}
        - 年月日干支：${lunarInfo.yearGanZhi}年 ${lunarInfo.monthGanZhi}月 ${lunarInfo.dayGanZhi}日
        - 當前時辰：${lunarInfo.timeGanZhi}時
        - 五行屬性：${lunarInfo.fiveElements}
        - 對應經絡：${lunarInfo.meridian.name}
        - 氣脈建議：${lunarInfo.qiAdvice}

        使用者目前感覺：${selectedFeeling}

        請針對使用者的狀態，提供一段約 100-150 字的「生活玄機」指引。
        要求：
        1. 語氣要親切、現代且富有智慧，像是一位懂中醫的朋友在聊天。
        2. 不要只是冷冰冰的數據，要轉化為有溫度的「微任務」或「身體狀態解讀」。
        3. 解釋這個時辰的能量如何影響他的身心狀態，並給出具體的行動建議。
        4. 參考「子午流注」的智慧，結合當下的五行能量。
        請用繁體中文回答。
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      const result = response.text || "時光流轉，順應自然即是智慧。目前無法取得詳細指引，請靜心感受當下。";
      setInsight(result);
      setIsInitialized(true);
      
      // Save to history
      const newRecord = {
        time: new Date().toISOString(),
        meridian: lunarInfo.meridian.name,
        feeling: selectedFeeling
      };
      const updatedHistory = [newRecord, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('qi_history', JSON.stringify(updatedHistory));
      
      // Log to Notion (Backend)
      try {
        await fetch('/api/notion/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            time: newRecord.time,
            meridian: lunarInfo.meridian.name,
            feeling: newRecord.feeling,
            fiveElements: lunarInfo.fiveElements,
            acupoint: lunarInfo.meridian.acupoint,
            qiAdvice: lunarInfo.qiAdvice,
            timeGanZhi: lunarInfo.timeGanZhi,
          }),
        });
      } catch (notionError) {
        console.error("Notion sync failed:", notionError);
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error(error);
      setInsight("時光流轉，順應自然即是智慧。目前無法取得詳細指引，請靜心感受當下。");
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case '木': return 'wood';
      case '火': return 'fire';
      case '土': return 'earth';
      case '金': return 'metal';
      case '水': return 'water';
      default: return 'accent';
    }
  };

  const getElementIcon = (element: string) => {
    switch (element) {
      case '木': return <Trees size={14} />;
      case '火': return <Flame size={14} />;
      case '土': return <Mountain size={14} />;
      case '金': return <Zap size={14} />;
      case '水': return <Droplets size={14} />;
      default: return <Sparkles size={14} />;
    }
  };

  const feelings = ["平常", "疲憊", "焦慮", "眼睛痠", "頭痛", "消化不良"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 bg-[#f5f5f0] selection:bg-accent/20">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent blur-[120px]" />
      </div>

      <main className="relative w-full max-w-3xl z-10">
        <AnimatePresence mode="wait">
          {!isInitialized ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              className="text-center"
            >
              <header className="mb-12">
                <h1 className="serif text-6xl md:text-7xl font-bold tracking-tighter text-accent mb-4">
                  時光玄機
                </h1>
                <p className="text-sm uppercase tracking-[0.4em] text-ink/40 font-medium mb-8">
                  Temporal Wisdom & Qi Flow
                </p>
                <div className="max-w-xl mx-auto text-ink/60 leading-relaxed">
                  <p className="italic mb-4">「天有其時，地有其利，人有其氣。」</p>
                  <p className="text-sm not-italic">
                    這是一個融合古老智慧與現代科技的數位嚮導。結合農民曆、五行學說與中醫「子午流注」規律，透過 AI 導師為您感應當下的能量狀態，提供專屬的生活指引與養生建議。
                  </p>
                  <p className="mt-4 font-medium">請靜下心來，選擇您當下的感受，開啟與時空的對話。</p>
                </div>
              </header>

              <div className="glass rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-accent/5 relative overflow-hidden mb-12">
                <div className="mb-12">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-6">
                    您現在感覺如何？ How are you feeling?
                  </h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {feelings.map(f => (
                      <button
                        key={f}
                        onClick={() => setSelectedFeeling(f)}
                        className={cn(
                          "px-6 py-3 rounded-full text-sm font-medium transition-all border",
                          selectedFeeling === f 
                            ? "bg-accent text-paper border-accent shadow-lg scale-110" 
                            : "bg-white/40 text-ink/60 border-white/20 hover:bg-white/60"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartRitual}
                  disabled={isLoading}
                  className={cn(
                    "group relative px-12 py-6 bg-accent text-paper rounded-full font-bold text-xl transition-all duration-500 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-2xl shadow-accent/30",
                    isLoading && "animate-pulse"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-4">
                    {isLoading ? (
                      <RefreshCw className="animate-spin" size={24} />
                    ) : (
                      <Sparkles size={24} />
                    )}
                    {isLoading ? "正在感應時空能量..." : "感應此時與我的關係"}
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  
                  {/* Ritual Effect Particles */}
                  {!isLoading && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-0 left-1/4 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                      <div className="absolute bottom-0 right-1/4 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                    </div>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            >
              {/* Header Section */}
              <header className="text-center mb-12">
                <h1 className="serif text-4xl md:text-5xl font-bold tracking-tighter text-accent mb-2">
                  時光玄機
                </h1>
                <p className="text-[10px] uppercase tracking-[0.3em] text-ink/40 font-medium">
                  Temporal Wisdom & Five Elements
                </p>
              </header>

              {/* Main Card */}
              <div className="glass rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-accent/5 relative overflow-hidden">
                {/* Current Time Display */}
                <div className="flex flex-col items-center mb-10 relative z-10">
                  <div className="flex items-center gap-2 text-accent/80 mb-2">
                    <Clock size={16} />
                    <span className="text-xs font-medium tracking-widest uppercase">
                      {currentTime.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="serif text-7xl md:text-8xl font-bold tracking-tighter text-ink">
                    {currentTime.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                </div>

                {/* Lunar Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 relative z-10">
                  <InfoCard 
                    label="農曆日期" 
                    value={lunarInfo.lunarDate} 
                    icon={<Wind size={14} className="text-accent" />}
                    color="accent"
                  />
                  <InfoCard 
                    label="當前時辰" 
                    value={lunarInfo.timeGanZhi} 
                    icon={<Clock size={14} className="text-accent" />}
                    color="accent"
                  />
                  <InfoCard 
                    label="五行屬性" 
                    value={lunarInfo.fiveElements} 
                    icon={getElementIcon(lunarInfo.fiveElements[0])}
                    color={getElementColor(lunarInfo.fiveElements[0])}
                  />
                  <InfoCard 
                    label="對應經絡" 
                    value={lunarInfo.meridian.name} 
                    icon={<Heart size={14} className="text-accent" />}
                    color={getElementColor(lunarInfo.meridian.element)}
                  />
                </div>

                {/* Meridian Visualization Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 relative z-10">
                  {/* Zi Wu Liu Zhu Circle */}
                  <div className="relative aspect-square flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-dashed border-accent/20 rounded-full" />
                    <div className="absolute inset-4 border border-accent/10 rounded-full" />
                    
                    {/* Meridian Markers */}
                    {['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].map((zhi, i) => {
                      const angle = (i * 30) - 90;
                      const isActive = lunarInfo.timeGanZhi.includes(zhi);
                      return (
                        <div 
                          key={zhi}
                          className="absolute"
                          style={{ 
                            transform: `rotate(${angle}deg) translate(110px) rotate(${-angle}deg)` 
                          }}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                            isActive ? "bg-accent text-paper scale-125 shadow-lg" : "bg-white/40 text-ink/40"
                          )}>
                            {zhi}
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="text-center z-10">
                      <div className="serif text-2xl font-bold text-accent">{lunarInfo.meridian.name}</div>
                      <div className="text-[10px] uppercase tracking-widest text-ink/40">Active Meridian</div>
                    </div>
                  </div>

                  {/* Acupoint & Massage Info */}
                  <div className="flex flex-col justify-center space-y-6">
                    <div className={cn(
                      "p-6 rounded-3xl border transition-all duration-500",
                      `bg-${getElementColor(lunarInfo.meridian.element)}/5 border-${getElementColor(lunarInfo.meridian.element)}/20`
                    )}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center text-paper",
                          `bg-${getElementColor(lunarInfo.meridian.element)}`
                        )}>
                          <MapPin size={20} />
                        </div>
                        <div>
                          <h3 className="serif text-lg font-bold">建議穴位：{lunarInfo.meridian.acupoint}</h3>
                          <p className="text-[10px] uppercase tracking-wider opacity-60">Recommended Acupoint</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">位置 Location</div>
                          <p className="text-sm leading-relaxed">{lunarInfo.meridian.location}</p>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">按摩益處 Benefits</div>
                          <p className="text-sm leading-relaxed text-accent font-medium">{lunarInfo.meridian.massageBenefit}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-accent/5 rounded-2xl p-5 border border-accent/10">
                      <div className="flex items-center gap-2 mb-2 text-accent">
                        <Activity size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">養生建議 Qi Advice</span>
                      </div>
                      <p className="text-sm italic text-ink/80 leading-relaxed">
                        「{lunarInfo.qiAdvice}」
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Insight Result */}
                <AnimatePresence>
                  {insight && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-10 border-t border-accent/10 relative z-10"
                    >
                      <div className="serif text-xl font-bold text-accent mb-4 flex items-center gap-2">
                        <ChevronRight size={20} />
                        生活玄機指引
                      </div>
                      <div className="text-ink/90 leading-relaxed bg-white/20 rounded-2xl p-8 italic relative">
                        <div className="absolute top-4 left-4 text-accent/10">
                          <Sparkles size={40} />
                        </div>
                        <p className="relative z-10">{insight}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Reset / Action Section */}
                <div className="mt-10 flex flex-col items-center gap-6 relative z-10">
                  <div className="flex flex-wrap justify-center gap-2">
                    {feelings.map(f => (
                      <button
                        key={f}
                        onClick={() => setSelectedFeeling(f)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[10px] font-medium transition-all border",
                          selectedFeeling === f 
                            ? "bg-accent text-paper border-accent shadow-md" 
                            : "bg-white/40 text-ink/60 border-white/20 hover:bg-white/60"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleStartRitual}
                      disabled={isLoading}
                      className="text-xs font-bold text-accent hover:underline flex items-center gap-2"
                    >
                      <RefreshCw className={cn(isLoading && "animate-spin")} size={14} />
                      重新感應當下
                    </button>
                    <button 
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-xs text-ink/40 hover:text-accent transition-colors flex items-center gap-1"
                    >
                      <Info size={12} />
                      了解更多
                    </button>
                  </div>
                </div>
              </div>

              {/* Qi Map / History Section */}
              {history.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 glass rounded-3xl p-8 relative z-10"
                >
                  <h4 className="serif text-lg font-bold text-ink mb-4">您的氣血足跡 (Qi Map)</h4>
                  <div className="space-y-3">
                    {history.map((record, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-3 rounded-xl bg-white/30 border border-white/20">
                        <div className="flex items-center gap-3">
                          <span className="text-ink/40">{new Date(record.time).toLocaleTimeString('zh-TW', {hour: '2-digit', minute: '2-digit'})}</span>
                          <span className="font-bold text-accent">{record.meridian}</span>
                        </div>
                        <span className="px-2 py-1 rounded-md bg-accent/10 text-accent">{record.feeling}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8 glass rounded-3xl p-8 text-sm text-ink/70 leading-relaxed"
            >
              <div className="mb-8 pb-8 border-b border-accent/10">
                <h4 className="serif text-xl font-bold text-accent mb-4">關於時光玄機</h4>
                <p className="text-base text-ink/80 leading-relaxed">
                  「時光玄機」是一個融合傳統智慧與現代科技的數位嚮導。我們結合了古老的農民曆、天干地支、五行學說，以及中醫的「子午流注」經絡智慧，透過 AI 技術為現代台灣人提供即時的生活指引。無論是當下的能量流動、身體經絡的運行，或是穴位養生建議，都能在這裡一目了然，幫助您在繁忙的現代生活中，重新找回與自然時序共鳴的節奏。
                </p>
              </div>

              <h4 className="serif text-lg font-bold text-ink mb-4">傳統智慧小百科</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h5 className="font-bold text-accent mb-2 uppercase tracking-widest text-[10px]">天干地支</h5>
                  <p>是中國古代用於記錄時間的系統。天干有十個，地支有十二個，兩者組合形成六十個循環，對應著宇宙能量的起伏。</p>
                </div>
                <div>
                  <h5 className="font-bold text-accent mb-2 uppercase tracking-widest text-[10px]">五行生剋</h5>
                  <p>木、火、土、金、水。古人認為萬物皆由這五種元素構成，它們相互影響、生克制化，也對應著不同的時辰與人體器官。</p>
                </div>
                <div>
                  <h5 className="font-bold text-accent mb-2 uppercase tracking-widest text-[10px]">子午流注</h5>
                  <p>中醫認為人體氣血在不同時辰會流經不同的經絡。順應這些規律生活，能達到養生防病的效果。</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-12 text-center text-ink/30 text-[10px] uppercase tracking-[0.2em]">
          &copy; 2026 時光玄機 &middot; 傳統智慧與現代生活的橋樑
        </footer>
      </main>
    </div>
  );
}

function InfoCard({ label, value, icon, color }: { label: string; value: string; icon: ReactNode; color: string }) {
  return (
    <div className={cn(
      "flex flex-col items-center p-4 rounded-2xl border transition-all hover:scale-105",
      `bg-${color}/5 border-${color}/10 hover:bg-${color}/10`
    )}>
      <div className={cn(
        "flex items-center gap-1.5 mb-1 opacity-60",
        `text-${color}`
      )}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="serif text-xl font-bold text-ink">{value}</div>
    </div>
  );
}
