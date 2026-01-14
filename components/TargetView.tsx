
import React, { useRef, useMemo } from 'react';

interface TargetViewProps {
  hOffset: number;
  vOffset: number;
  onPointSelected: (h: number, v: number) => void;
  unitLabel: string;
}

const TargetView: React.FC<TargetViewProps> = ({ hOffset, vOffset, onPointSelected, unitLabel }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Configuração do Grid
  const squaresCount = 10; // 10 quadrados para cada lado do centro
  const viewBoxSize = 400; // Tamanho interno do SVG
  const center = viewBoxSize / 2;
  const step = center / squaresCount; // Espaço entre linhas em unidades do viewBox (20 unidades)
  const squareSizeCm = 1.5;

  const handleInteraction = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    
    if ('touches' in e) {
      pt.x = e.touches[0].clientX;
      pt.y = e.touches[0].clientY;
    } else {
      pt.x = e.clientX;
      pt.y = e.clientY;
    }

    const cursorPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    // Converter coordenadas do ViewBox para CM
    // No viewBox, 'step' (20 unidades) = 1.5cm
    // Logo, 1 unidade = 1.5 / step = 0.075cm
    const cmX = (cursorPt.x - center) * (squareSizeCm / step);
    const cmY = (center - cursorPt.y) * (squareSizeCm / step);
    
    onPointSelected(
      parseFloat(cmX.toFixed(1)), 
      parseFloat(cmY.toFixed(1))
    );
  };

  // Posição do ponto de impacto no ViewBox
  const impactX = center + (hOffset * (step / squareSizeCm));
  const impactY = center - (vOffset * (step / squareSizeCm));

  // Gerar linhas do grid e números
  const gridElements = useMemo(() => {
    const lines = [];
    const labels = [];
    
    for (let i = -squaresCount; i <= squaresCount; i++) {
      const pos = center + i * step;
      
      // Linhas verticais e horizontais
      lines.push(
        <line key={`v-${i}`} x1={pos} y1="0" x2={pos} y2={viewBoxSize} stroke={i === 0 ? "#94a3b8" : "#e2e8f0"} strokeWidth={i === 0 ? "2" : "1"} />,
        <line key={`h-${i}`} x1="0" y1={pos} x2={viewBoxSize} y2={pos} stroke={i === 0 ? "#94a3b8" : "#e2e8f0"} strokeWidth={i === 0 ? "2" : "1"} />
      );

      // Números nos eixos (pula o zero para não poluir)
      if (i !== 0 && i % 2 === 0) {
        labels.push(
          <text key={`lx-${i}`} x={pos} y={center + 15} fontSize="10" fill="#94a3b8" textAnchor="middle" fontWeight="bold" className="select-none pointer-events-none">{i}</text>,
          <text key={`ly-${i}`} x={center - 15} y={pos + 4} fontSize="10" fill="#94a3b8" textAnchor="end" fontWeight="bold" className="select-none pointer-events-none">{-i}</text>
        );
      }
    }
    return { lines, labels };
  }, [center, step, viewBoxSize, squaresCount]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="w-full bg-white rounded-3xl shadow-2xl border-4 border-slate-200 overflow-hidden relative group">
        <svg 
          ref={svgRef}
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="w-full aspect-square touch-none cursor-crosshair bg-slate-50"
          onClick={handleInteraction}
          onTouchStart={handleInteraction}
        >
          {/* Grid e Eixos */}
          {gridElements.lines}
          {gridElements.labels}

          {/* Anéis de Referência */}
          <circle cx={center} cy={center} r={step * 2} fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 2" />
          <circle cx={center} cy={center} r={step * 4} fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 2" />
          <circle cx={center} cy={center} r={step * 6} fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 2" />

          {/* Mosca (Centro) */}
          <circle cx={center} cy={center} r="8" fill="#ef4444" className="filter drop-shadow-md" />
          <circle cx={center} cy={center} r="3" fill="white" />

          {/* Ponto de Impacto */}
          <g style={{ transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <circle 
              cx={impactX} 
              cy={impactY} 
              r="10" 
              fill="#f97316" 
              className="animate-pulse"
              stroke="white"
              strokeWidth="2"
            />
            <circle 
              cx={impactX} 
              cy={impactY} 
              r="25" 
              fill="#f97316" 
              fillOpacity="0.1" 
            />
          </g>
        </svg>

        {/* Overlay de coordenadas no canto */}
        <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest pointer-events-none border border-slate-700">
           OFFSET: {hOffset.toFixed(1)} {unitLabel} | {vOffset.toFixed(1)} {unitLabel}
        </div>
      </div>
      
      <div className="mt-4 flex space-x-6 text-slate-400 font-bold text-[10px] uppercase tracking-tighter">
        <span className="flex items-center"><div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div> Ponto de Mira</span>
        <span className="flex items-center"><div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div> Ponto de Impacto</span>
        <span className="flex items-center"><i className="fa-solid fa-expand mr-1"></i> Grid 1.5cm</span>
      </div>
    </div>
  );
};

export default TargetView;
