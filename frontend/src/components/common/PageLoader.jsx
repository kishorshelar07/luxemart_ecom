import React from 'react';
export default function PageLoader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48,height:48,border:'3px solid var(--border-medium)',borderTopColor:'var(--accent-gold)',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 16px' }} />
        <p style={{ color:'var(--text-muted)',fontFamily:'var(--font-ui)',fontSize:14 }}>Loading...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
