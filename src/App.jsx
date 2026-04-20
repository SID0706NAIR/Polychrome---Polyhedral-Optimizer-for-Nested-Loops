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
  const [matrix, setMatrix] = useState(TRANSFORMATIONS.IDENTITY);
  const [points, setPoints] = useState([]);
  const [activeTab, setActiveTab] = useState('editor');

  const [code, setCode] = useState(
    `for (int i = 0; i < 10; i++) {\n  for (int j = 0; j < 10; j++) {\n    S(i, j);\n  }\n}`
  );

  useEffect(() => {
    // Basic regex parser for loop bounds
    const iMatch = code.match(/i\s*<\s*(\d+)/);
    const jMatch = code.match(/j\s*<\s*(\d+)/);
    
    if (iMatch) setIMax(Math.min(20, parseInt(iMatch[1])));
    if (jMatch) setJMax(Math.min(20, parseInt(jMatch[1])));
  }, [code]);

  useEffect(() => {
    const initialPoints = generateIterationDomain(0, iMax - 1, 0, jMax - 1);
    setPoints(applyOptimization(initialPoints, matrix));
  }, [iMax, jMax, matrix]);

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
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ 
                width: '100%', 
                height: '180px', 
                resize: 'none', 
                backgroundColor: 'rgba(0,0,0,0.3)',
                fontSize: '13px',
                padding: '16px',
                lineHeight: '1.6'
              }}
              spellCheck="false"
            />
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Tip: Edit the bounds (e.g., <code style={{color: '#fff'}}>i &lt; 15</code>) to update the space. (Max 20)
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Settings size={18} color="var(--accent-color)" />
              <h2 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transformations</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button className="button-primary" onClick={() => handleTransform('IDENTITY')} style={{ background: matrix === TRANSFORMATIONS.IDENTITY ? 'var(--accent-color)' : 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>Identity</button>
              <button className="button-primary" onClick={() => handleTransform('SKEW')} style={{ background: matrix === TRANSFORMATIONS.SKEW ? 'var(--accent-color)' : 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>Skewing</button>
              <button className="button-primary" onClick={() => handleTransform('INTERCHANGE')} style={{ background: matrix === TRANSFORMATIONS.INTERCHANGE ? 'var(--accent-color)' : 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>Interchange</button>
              <button className="button-primary" onClick={() => handleTransform('REVERSE')} style={{ background: matrix === TRANSFORMATIONS.REVERSE ? 'var(--accent-color)' : 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>Reverse</button>
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
                <BlockMath math={getInequalityLatex(iMax, jMax)} />
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
        <IterationSpace points={points} />
        
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
             <pre className="glass-panel" style={{ padding: '12px', background: 'rgba(0,0,0,0.4)', fontSize: '12px', color: '#888', border: '1px dashed var(--border-color)' }}>
               {`for (int i = 0; i < ${iMax}; i++) {\n  for (int j = 0; j < ${jMax}; j++) {\n    S(i, j);\n  }\n}`}
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
               {generateOptimizedCode(iMax, jMax, matrix)}
             </pre>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
