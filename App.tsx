
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TargetView from './components/TargetView';
import { UnitSystem, AdjustmentType, ZeroInput, ZeroResult, InputMode } from './types';
import { getShootingTips } from './services/geminiService';

const App: React.FC = () => {
  const [input, setInput] = useState<ZeroInput>({
    distance: 25,
    unit: UnitSystem.METRIC,
    inputMode: InputMode.MEASURED,
    adjustment: AdjustmentType.MOA_1_4,
    horizontalOffset: 0,
    verticalOffset: 0
  });

  const [result, setResult] = useState<ZeroResult | null>(null);
  const [aiTips, setAiTips] = useState<string>('');
  const [loadingTips, setLoadingTips] = useState(false);

  const calculateZero = useCallback(() => {
    const { distance, unit, adjustment, horizontalOffset, verticalOffset } = input;
    let clickValueAtDistance = 0;

    const hOffsetCm = horizontalOffset;
    const vOffsetCm = verticalOffset;

    if (unit === UnitSystem.METRIC) {
      if (adjustment.includes('MIL')) {
        const milFactor = adjustment === AdjustmentType.MIL_0_1 ? 0.1 : 0.05;
        clickValueAtDistance = (distance / 10) * milFactor;
      } else {
        const moaFactor = adjustment === AdjustmentType.MOA_1_4 ? 0.25 : 
                         adjustment === AdjustmentType.MOA_1_8 ? 0.125 : 0.5;
        clickValueAtDistance = ((2.908 * distance) / 100) * moaFactor;
      }
    } else {
      if (adjustment.includes('MOA')) {
        const moaFactor = adjustment === AdjustmentType.MOA_1_4 ? 0.25 : 
                         adjustment === AdjustmentType.MOA_1_8 ? 0.125 : 0.5;
        clickValueAtDistance = ((1.047 * distance) / 100) * moaFactor;
      } else {
        const milFactor = adjustment === AdjustmentType.MIL_0_1 ? 0.1 : 0.05;
        clickValueAtDistance = ((3.6 * distance) / 100) * milFactor;
      }
    }

    if (clickValueAtDistance === 0) return;

    const hClicks = Math.round(Math.abs(hOffsetCm) / clickValueAtDistance);
    const vClicks = Math.round(Math.abs(vOffsetCm) / clickValueAtDistance);

    const hDir = hOffsetCm > 0 ? 'LEFT' : hOffsetCm < 0 ? 'RIGHT' : 'NONE';
    const vDir = vOffsetCm > 0 ? 'DOWN' : vOffsetCm < 0 ? 'UP' : 'NONE';

    setResult({
      horizontalClicks: hClicks,
      horizontalDirection: hDir,
      verticalClicks: vClicks,
      verticalDirection: vDir,
      description: `Cada clique desloca o impacto ~${clickValueAtDistance.toFixed(2)} ${unit === UnitSystem.METRIC ? 'cm' : 'pol'} a esta distância.`
    });
  }, [input]);

  useEffect(() => {
    calculateZero();
  }, [calculateZero]);

  const fetchTips = async () => {
    setLoadingTips(true);
    try {
      const avgOffset = (Math.abs(input.horizontalOffset) + Math.abs(input.verticalOffset)) / 2;
      const tips = await getShootingTips(avgOffset, input.distance);
      setAiTips(tips || "Foque na consistência da sua visada.");
    } catch (e) {
      setAiTips("Não foi possível carregar as dicas agora.");
    } finally {
      setLoadingTips(false);
    }
  };

  const handleTargetPoint = (h: number, v: number) => {
    setInput(prev => ({
      ...prev,
      horizontalOffset: h,
      verticalOffset: v
    }));
  };

  const reset = () => {
    setInput({
      distance: 25,
      unit: UnitSystem.METRIC,
      inputMode: InputMode.MEASURED,
      adjustment: AdjustmentType.MOA_1_4,
      horizontalOffset: 0,
      verticalOffset: 0
    });
    setAiTips('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12 font-sans">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="xl:col-span-6 flex flex-col items-center">
             <div className="w-full">
                <TargetView 
                    hOffset={input.horizontalOffset} 
                    vOffset={input.verticalOffset} 
                    onPointSelected={handleTargetPoint}
                    unitLabel={input.unit === UnitSystem.METRIC ? 'cm' : 'pol'}
                />
             </div>
             
             <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-lg">
                <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="bg-slate-50 p-3 rounded-2xl text-slate-400">
                    <i className="fa-solid fa-arrows-left-right"></i>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-tighter">Horizontal</label>
                    <input 
                        type="number" step="0.1"
                        className="w-full bg-transparent font-black text-xl text-slate-800 outline-none"
                        value={input.horizontalOffset}
                        onChange={(e) => setInput({...input, horizontalOffset: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="bg-slate-50 p-3 rounded-2xl text-slate-400">
                    <i className="fa-solid fa-arrows-up-down"></i>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-tighter">Vertical</label>
                    <input 
                        type="number" step="0.1"
                        className="w-full bg-transparent font-black text-xl text-slate-800 outline-none"
                        value={input.verticalOffset}
                        onChange={(e) => setInput({...input, verticalOffset: Number(e.target.value)})}
                    />
                  </div>
                </div>
             </div>
          </div>

          <div className="xl:col-span-3 space-y-6">
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-xs font-black text-slate-400 mb-6 uppercase tracking-widest flex items-center">
                <i className="fa-solid fa-sliders mr-2 text-orange-500"></i>
                Parâmetros
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Padrão de Ajuste</label>
                  <select 
                    className="w-full p-3 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 focus:border-orange-500 outline-none transition-all appearance-none"
                    value={input.adjustment}
                    onChange={(e) => setInput({...input, adjustment: e.target.value as AdjustmentType})}
                  >
                    <optgroup label="MOA">
                      <option value={AdjustmentType.MOA_1_4}>1/4 MOA</option>
                      <option value={AdjustmentType.MOA_1_8}>1/8 MOA</option>
                      <option value={AdjustmentType.MOA_1_2}>1/2 MOA</option>
                    </optgroup>
                    <optgroup label="MIL (mrad)">
                      <option value={AdjustmentType.MIL_0_1}>0.1 MIL</option>
                      <option value={AdjustmentType.MIL_0_05}>0.05 MIL</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">
                    Distância ({input.unit === UnitSystem.METRIC ? 'Metros' : 'Yards'})
                  </label>
                  <input 
                    type="number"
                    className="w-full p-3 rounded-2xl border-2 border-slate-100 bg-slate-50 font-black text-slate-800 focus:border-orange-500 outline-none transition-all"
                    value={input.distance}
                    onChange={(e) => setInput({...input, distance: Number(e.target.value)})}
                  />
                </div>

                <div className="flex bg-slate-100 p-1 rounded-2xl">
                  <button 
                    onClick={() => setInput({...input, unit: UnitSystem.METRIC})}
                    className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${input.unit === UnitSystem.METRIC ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}
                  >MÉTRICO</button>
                  <button 
                    onClick={() => setInput({...input, unit: UnitSystem.IMPERIAL})}
                    className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${input.unit === UnitSystem.IMPERIAL ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}
                  >IMPERIAL</button>
                </div>
              </div>
            </section>

            <section className="bg-orange-50 border-2 border-orange-100 p-6 rounded-3xl">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-orange-600 mb-4 flex items-center">
                    <i className="fa-solid fa-bolt mr-2"></i> Assistente IA
                </h3>
                {aiTips ? (
                    <div className="text-xs text-orange-900 leading-relaxed font-medium whitespace-pre-wrap">{aiTips}</div>
                ) : (
                    <p className="text-[11px] text-orange-700/70 italic leading-relaxed">Clique abaixo para analisar seu agrupamento e receber dicas de postura e gatilho.</p>
                )}
                <button 
                    onClick={fetchTips}
                    disabled={loadingTips}
                    className="w-full mt-5 py-3 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 disabled:opacity-50"
                >
                    {loadingTips ? 'Processando...' : 'Analisar meu Tiro'}
                </button>
            </section>
          </div>

          <div className="xl:col-span-3 space-y-6">
            <section className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl border-b-8 border-orange-500">
              <h2 className="text-[10px] font-black mb-10 uppercase tracking-[0.3em] text-orange-400 flex items-center justify-center">
                <i className="fa-solid fa-bullseye mr-2"></i>
                Correção
              </h2>

              {result && (
                <div className="space-y-12">
                  <div className="text-center group">
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-4">Windage (Deriva)</p>
                    <div className="inline-flex items-baseline space-x-2">
                        <span className="text-7xl font-black tabular-nums tracking-tighter">{result.horizontalClicks}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Cliques</span>
                    </div>
                    <div className={`mt-3 py-2 px-4 rounded-full text-xs font-black inline-block transition-all ${result.horizontalDirection === 'NONE' ? 'bg-slate-800 text-slate-500' : 'bg-orange-600 text-white shadow-lg shadow-orange-900/40'}`}>
                        {result.horizontalDirection === 'NONE' ? 'CENTRO' : 
                         result.horizontalDirection === 'LEFT' ? '← GIRAR P/ ESQUERDA' : 'GIRAR P/ DIREITA →'}
                    </div>
                  </div>

                  <div className="text-center group">
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-4">Elevation (Elevação)</p>
                    <div className="inline-flex items-baseline space-x-2">
                        <span className="text-7xl font-black tabular-nums tracking-tighter">{result.verticalClicks}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Cliques</span>
                    </div>
                    <div className={`mt-3 py-2 px-4 rounded-full text-xs font-black inline-block transition-all ${result.verticalDirection === 'NONE' ? 'bg-slate-800 text-slate-500' : 'bg-orange-600 text-white shadow-lg shadow-orange-900/40'}`}>
                        {result.verticalDirection === 'NONE' ? 'CENTRO' : 
                         result.verticalDirection === 'UP' ? '↑ GIRAR P/ CIMA' : 'GIRAR P/ BAIXO ↓'}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-800 text-center">
                    <p className="text-[10px] text-slate-500 italic leading-tight">
                      {result.description}
                    </p>
                    <button 
                      onClick={reset}
                      className="w-full mt-10 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      Resetar
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-16 text-center text-slate-300 text-[9px] uppercase font-black tracking-[0.3em] pb-10">
        Desenvolvido para Atiradores de Precisão
      </footer>
    </div>
  );
};

export default App;
