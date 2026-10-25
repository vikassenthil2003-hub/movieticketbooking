import React from 'react';

const ScreenIndicator = () => {
  return (
    <div className="w-full max-w-2xl mx-auto my-8 text-center">
      {/* Curved Glowing Cinema Screen */}
      <div className="cinema-screen-glow" />
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-3">
        SCREEN THIS WAY
      </p>
    </div>
  );
};

export default ScreenIndicator;
