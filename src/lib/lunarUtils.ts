import { Solar, Lunar, HolidayUtil } from 'lunar-javascript';

export interface MeridianInfo {
  name: string;
  advice: string;
  acupoint: string;
  massageBenefit: string;
  location: string;
  element: string;
}

export interface LunarInfo {
  lunarDate: string;
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  timeGanZhi: string;
  zodiac: string;
  solarTerm: string;
  fiveElements: string;
  meridian: MeridianInfo;
  qiAdvice: string;
}

const MERIDIANS: Record<string, MeridianInfo> = {
  '子': { 
    name: '膽經', 
    advice: '宜睡眠，養膽氣。', 
    acupoint: '風池穴', 
    location: '後頸部，枕骨下兩側凹陷處。',
    massageBenefit: '緩解頭痛、目眩，幫助入眠。',
    element: '木'
  },
  '丑': { 
    name: '肝經', 
    advice: '宜熟睡，肝臟排毒。', 
    acupoint: '太衝穴', 
    location: '足背側，第一、二趾蹠骨連接部位凹陷處。',
    massageBenefit: '疏肝理氣，緩解壓力與情緒不穩。',
    element: '木'
  },
  '寅': { 
    name: '肺經', 
    advice: '宜深呼吸，肺氣運行。', 
    acupoint: '太淵穴', 
    location: '腕掌側橫紋橈側端，橈動脈搏動處。',
    massageBenefit: '止咳化痰，加強呼吸系統功能。',
    element: '金'
  },
  '卯': { 
    name: '大腸經', 
    advice: '宜排便，清理腸道。', 
    acupoint: '合谷穴', 
    location: '手背虎口處，第二掌骨橈側的中點。',
    massageBenefit: '緩解牙痛、便秘，增強免疫力。',
    element: '金'
  },
  '辰': { 
    name: '胃經', 
    advice: '宜進食早餐，補充能量。', 
    acupoint: '足三里', 
    location: '小腿前外側，外膝眼下三寸。',
    massageBenefit: '調理脾胃，增強體力與消化能力。',
    element: '土'
  },
  '巳': { 
    name: '脾經', 
    advice: '宜工作學習，脾氣運化。', 
    acupoint: '三陰交', 
    location: '小腿內側，足內踝尖上三寸。',
    massageBenefit: '健脾益氣，調理內分泌與婦科問題。',
    element: '土'
  },
  '午': { 
    name: '心經', 
    advice: '宜小憩，養心神。', 
    acupoint: '神門穴', 
    location: '腕部掌側橫紋尺側端，尺側腕屈肌腱橈側凹陷處。',
    massageBenefit: '安神定志，緩解心悸與失眠。',
    element: '火'
  },
  '未': { 
    name: '小腸經', 
    advice: '宜消化午餐，吸收營養。', 
    acupoint: '後溪穴', 
    location: '微握拳，第五指掌關節後尺側的遠側掌橫紋頭赤白肉際。',
    massageBenefit: '清心安神，緩解頸椎痠痛。',
    element: '火'
  },
  '申': { 
    name: '膀胱經', 
    advice: '宜多喝水，利尿排毒。', 
    acupoint: '委中穴', 
    location: '膕橫紋中點，當股二頭肌腱與半腱肌腱的中間。',
    massageBenefit: '緩解腰背痠痛，利尿排毒。',
    element: '水'
  },
  '酉': { 
    name: '腎經', 
    advice: '宜休息，儲藏精氣。', 
    acupoint: '湧泉穴', 
    location: '足底部，蜷足時足前部凹陷處。',
    massageBenefit: '補腎益精，緩解疲勞與水腫。',
    element: '水'
  },
  '戌': { 
    name: '心包經', 
    advice: '宜放鬆心情，保護心臟。', 
    acupoint: '內關穴', 
    location: '前臂掌側，當曲澤與大陵的連線上，腕橫紋上二寸。',
    massageBenefit: '寬胸理氣，緩解心痛、胃痛。',
    element: '火'
  },
  '亥': { 
    name: '三焦經', 
    advice: '宜安靜休養，通調水道。', 
    acupoint: '外關穴', 
    location: '前臂背側，當陽池與肘尖的連線上，腕背橫紋上二寸。',
    massageBenefit: '清熱解表，緩解偏頭痛與耳鳴。',
    element: '火'
  },
};

const FIVE_ELEMENTS: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
  '子': '水', '丑': '土',
  '寅': '木', '卯': '木',
  '辰': '土', '巳': '火',
  '午': '火', '未': '土',
  '申': '金', '酉': '金',
  '戌': '土', '亥': '水',
};

export function getLunarInfo(date: Date = new Date()): LunarInfo {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  
  const timeZhi = lunar.getTimeZhi();
  const timeGan = lunar.getTimeGan();

  const meridianInfo = MERIDIANS[timeZhi] || { 
    name: '未知', 
    advice: '順應自然。',
    acupoint: '無',
    location: '未知',
    massageBenefit: '無',
    element: '未知'
  };

  return {
    lunarDate: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    yearGanZhi: lunar.getYearInGanZhi(),
    monthGanZhi: lunar.getMonthInGanZhi(),
    dayGanZhi: lunar.getDayInGanZhi(),
    timeGanZhi: `${timeGan}${timeZhi}`,
    zodiac: lunar.getYearShengXiao(),
    solarTerm: lunar.getJieQi() || '無節氣',
    fiveElements: `${FIVE_ELEMENTS[timeGan] || ''}${FIVE_ELEMENTS[timeZhi] || ''}`,
    meridian: meridianInfo,
    qiAdvice: meridianInfo.advice,
  };
}
