import React from 'react';

const STAFF_LIST = [
  {name:'Maria Santos',email:'maria@sampings.ph',role:'Production Staff',avatar:'MS',status:'active',orders:47,joined:'Jan 2026'},
  {name:'Kevin Torres',email:'kevin@sampings.ph',role:'Order Processing',avatar:'KT',status:'active',orders:53,joined:'Feb 2026'},
  {name:'Liza Ramos',email:'liza@sampings.ph',role:'Customer Service',avatar:'LR',status:'active',orders:31,joined:'Mar 2026'},
  {name:'Arnold Diaz',email:'arnold@sampings.ph',role:'Production Staff',avatar:'AD',status:'inactive',orders:12,joined:'Dec 2025'},
];

const StaffMgmt = () => {
  return (
    <div className="page-body">
      <div className="toolbar" style={{marginBottom: '1.25rem'}}>
        <div className="search-wrap" style={{position:'relative', maxWidth:'360px'}}><span className="search-icon">🔍</span><input className="search-input" placeholder="Search staff..." /></div>
        <select className="filter-select"><option>All Status</option><option>Active</option><option>Inactive</option></select>
      </div>
      <div className="staff-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'16px'}}>
        {STAFF_LIST.map(s => (
          <div className="card" key={s.email} style={{display:'flex', gap:'15px', alignItems:'center'}}>
            <div style={{width:'48px', height:'48px', borderRadius:'12px', background:'var(--navy)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bebas Neue', fontSize:'20px'}}>{s.avatar}</div>
            <div style={{flex:1}}>
                <div style={{fontWeight:'700', fontSize:'16px'}}>{s.name}</div>
                <div style={{fontSize:'12px', color:'var(--muted)'}}>{s.role}</div>
                <div style={{marginTop:'8px'}}>
                    <span className={`badge ${s.status === 'active' ? 'badge-completed' : 'badge-rejected'}`} style={{fontSize:'10px'}}>
                        {s.status.toUpperCase()}
                    </span>
                </div>
            </div>
            <button className="btn-navy" style={{padding:'6px 12px', fontSize:'11px', background:'transparent', color:'var(--navy)', border:'1px solid var(--navy)'}}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffMgmt;
