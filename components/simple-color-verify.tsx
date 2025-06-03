"use client"

export function SimpleColorVerify() {
  if (process.env.NODE_ENV === "production") return null
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '200px'
    }}>
      <div style={{marginBottom: '4px', fontWeight: 'bold'}}>🎨 Color Check</div>
      <div style={{marginBottom: '2px'}}>
        <span style={{backgroundColor: '#020408', width: '12px', height: '12px', display: 'inline-block', marginRight: '4px', border: '1px solid #666'}}></span>
        Background: #020408
      </div>
      <div style={{marginBottom: '2px'}}>
        <span style={{backgroundColor: '#050B12', width: '12px', height: '12px', display: 'inline-block', marginRight: '4px'}}></span>
        Sections: #050B12
      </div>
      <div style={{marginBottom: '2px'}}>
        <span style={{backgroundColor: '#D4AF37', width: '12px', height: '12px', display: 'inline-block', marginRight: '4px'}}></span>
        Gold: #D4AF37
      </div>
    </div>
  )
} 