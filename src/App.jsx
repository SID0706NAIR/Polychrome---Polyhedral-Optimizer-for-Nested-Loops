import React, { useState, useEffect } from 'react';
import IterationSpace from './IterationSpace';
import { 
  generateIterationDomain, 
  applyOptimization, 
  TRANSFORMATIONS, 
  getMatrixLatex, 
  getInequalityLatex,
  generateOptimizedCode 
} from './polyhedralEngine';
import { Code, Settings, Info, Play, RefreshCw, Cpu, Layers } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

function App() {
  const [iMax, setIMax] = useState(10);
  const [jMax, setJMax] = useState(10);
  const [kMax, setKMax] = useState(0);
  const [matrix, setMatrix] = useState(TRANSFORMATIONS.IDENTITY);
  const [points, setPoints] = useState([]);
  const [activeTab, setActiveTab] = useState('editor');

  const [pendingCode, setPendingCode] = useState(
    `for (int i = -4; i <= 4; i++) {\n  for (int j = -(4 - abs(i)); j <= (4 - abs(i)); j++) {\n    for (int k = -(4 - abs(i) - abs(j)); k <= (4 - abs(i) - abs(j)); k++) {\n      S(i, j, k);\n    }\n  }\n}`
  );
  const [appliedCode, setAppliedCode] = useState(pendingCode);

  const [domainType, setDomainType] = useState('rectangular');

  useEffect(() => {
    if (appliedCode.includes('abs(')) {
      setDomainType('diamond');
      setIMax(4);
      return;
    }

    setDomainType('rectangular');
    // Basic regex parser for loop bounds
    const iMatch = appliedCode.match(/i\s*[<=]+\s*(-?\d+|N)/);
    const jMatch = appliedCode.match(/j\s*[<=]+\s*(-?\d+|N)/);
    const kMatch = appliedCode.match(/k\s*[<=]+\s*(-?\d+|N)/);
    
    const parseBound = (match) => {
      if (!match) return 0;
      if (match[1] === 'N') return 4;
      return Math.min(10, parseInt(match[1])); 
    };

    setIMax(parseBound(iMatch) || 4);
    setJMax(parseBound(jMatch) || 4);
    setKMax(parseBound(kMatch) || 4);
  }, [appliedCode]);



  const [highlightI, setHighlightI] = useState(0);
  const [highlightJ, setHighlightJ] = useState(0);
  const [highlightK, setHighlightK] = useState(0);

  const handleApply = () => {
    setAppliedCode(pendingCode);
  };

  useEffect(() => {
    const initialPoints = generateIterationDomain(0, iMax - 1, 0, jMax - 1, 0, kMax - 1, domainType);
    setPoints(applyOptimization(initialPoints, matrix));
  }, [iMax, jMax, kMax, matrix, domainType]);

  const handleTransform = (type) => {
    setMatrix(TRANSFORMATIONS[type]);
  };

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar / Controls */}
      <aside className="glass-panel" style={{ width: '400px', margin: '20px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <header style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Cpu size={28} color="var(--accent-color)" />
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Polychrome</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Polyhedral Loop Optimizer</p>
        </header>

        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <section style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Code size={18} color="var(--accent-color)" />
              <h2 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source Code Editor</h2>
            </div>
            
            <textarea
              className="input-field"
              value={pendingCode}
              onChange={(e) => setPendingCode(e.target.value)}
              style={{ 
                width: '100%', 
                height: '140px', 
                resize: 'none', 
                backgroundColor: 'rgba(0,0,0,0.3)',
                fontSize: '13px',
                padding: '16px',
                lineHeight: '1.6',
                marginBottom: '12px'
              }}
              spellCheck="false"
            />
            
            <button 
              className="button-primary" 
              onClick={handleApply}
              style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                background: pendingCode !== appliedCode ? 'var(--accent-color)' : 'var(--surface-color)',
                opacity: pendingCode !== appliedCode ? 1 : 0.6
              }}
            >
              <RefreshCw size={16} /> Apply Changes
            </button>
          </section>

          <section style={{ marginBottom: '32px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Layers size={18} color="var(--success-color)" />
              <h2 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Highlight Node (i, j, k)</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Index I</label>
                  <input type="number" className="input-field" style={{ width: '100%', padding: '4px' }} value={highlightI} onChange={(e) => setHighlightI(parseInt(e.target.value) || 0)} />
               </div>
               <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Index J</label>
                  <input type="number" className="input-field" style={{ width: '100%', padding: '4px' }} value={highlightJ} onChange={(e) => setHighlightJ(parseInt(e.target.value) || 0)} />
               </div>
               <div>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Index K</label>
                  <input type="number" className="input-field" style={{ width: '100%', padding: '4px' }} value={highlightK} onChange={(e) => setHighlightK(parseInt(e.target.value) || 0)} />
               </div>
            </div>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Settings size={18} color="var(--accent-color)" />
              <h2 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transformations</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button className="button-primary" onClick={() => handleTransform('IDENTITY')} style={{ background: matrix === TRANSFORMATIONS.IDENTITY ? 'var(--accent-color)' : 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: '12px' }}>Identity</button>
              <button className="button-primary" onClick={() => handleTransform('SKEW')} style={{ background: matrix === TRANSFORMATIONS.SKEW ? 'var(--accent-color)' : 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: '12px' }}>Skewing</button>
              <button className="button-primary" onClick={() => handleTransform('INTERCHANGE_IJ')} style={{ background: matrix === TRANSFORMATIONS.INTERCHANGE_IJ ? 'var(--accent-color)' : 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: '12px' }}>Interchange (I,J)</button>
              <button className="button-primary neon-glow" onClick={() => handleTransform('MATMUL_IKJ')} style={{ background: matrix === TRANSFORMATIONS.MATMUL_IKJ ? 'var(--accent-color)' : 'rgba(59, 130, 246, 0.1)', color: 'var(--text-primary)', border: '1px solid var(--accent-color)', fontSize: '12px' }}>Matrix Mult (I,K,J)</button>
            </div>
          </section>

          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Info size={18} color="var(--accent-color)" />
              <h2 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>The Math</h2>
            </div>
            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Iteration Domain</div>
                <BlockMath math={getInequalityLatex(iMax, jMax, kMax, domainType)} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Transformation Matrix $T$</div>
                <BlockMath math={getMatrixLatex(matrix)} />
              </div>
            </div>
          </section>
        </div>

        <footer style={{ padding: '24px', borderTop: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Compiler Design Hackathon 2026
        </footer>
      </aside>

      {/* Main Viewport */}
      <main style={{ flex: 1, position: 'relative' }}>
        <IterationSpace 
          points={points} 
          highlight={{i: highlightI, j: highlightJ, k: highlightK}} 
        />
        
        {/* Floating HUD */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '12px' }}>
           <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers size={16} color="var(--accent-color)" />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{points.length} Iterations</span>
           </div>
        </div>

        <div className="glass-panel" style={{ position: 'absolute', bottom: '20px', right: '20px', left: '440px', padding: '24px', display: 'flex', gap: '24px', overflow: 'hidden' }}>
          <div style={{ flex: 1 }}>
             <h3 style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>Original Code</h3>
             <pre className="glass-panel" style={{ padding: '12px', background: 'rgba(0,0,0,0.4)', fontSize: '12px', color: '#888', border: '1px dashed var(--border-color)', whiteSpace: 'pre-wrap' }}>
               {domainType === 'diamond' 
                 ? appliedCode 
                 : `for (int i = 0; i < ${iMax}; i++) {\n  for (int j = 0; j < ${jMax}; j++) {\n    S(i, j);\n  }\n}`}
             </pre>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <RefreshCw size={24} color="var(--accent-color)" />
          </div>

          <div style={{ flex: 1 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '12px', color: 'var(--accent-color)', textTransform: 'uppercase' }}>Optimized Output</h3>
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'var(--accent-color)', color: '#fff' }}>POLYSYNC ACTIVE</span>
             </div>
             <pre className="glass-panel" style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.05)', fontSize: '12px', color: 'var(--text-primary)', border: '1px solid var(--accent-glow)' }}>
                {generateOptimizedCode(iMax, jMax, kMax, matrix, domainType)}
             </pre>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
