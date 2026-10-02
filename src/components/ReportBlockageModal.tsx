import React, { useState } from 'react';
import { X, AlertTriangle, Send, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

interface ReportBlockageModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'gu' | 'en';
}

export const ReportBlockageModal: React.FC<ReportBlockageModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [locationText, setLocationText] = useState('એસ.જી. હાઇવે, પકવાન સર્કલ પાસે');
  const [blockageType, setBlockageType] = useState('illegal_parking');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {lang === 'gu' ? 'ઇમરજન્સી માર્ગ અવરોધ રિપોર્ટ' : 'Report Emergency Road Blockage'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'gu'
                    ? 'ગુજરાત ટ્રાફિક પોલીસ અને ૧૦૮ કમાન્ડ રૂમને ત્વરિત સૂચના'
                    : 'Instant report to Gujarat Traffic Police & 108 Dispatch'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-5">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  {lang === 'gu' ? 'અવરોધનું સ્થળ:' : 'Location:'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    placeholder="દા.ત. ઈસ્કોન ક્રોસરોડ્સ, અમદાવાદ"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  {lang === 'gu' ? 'અવરોધનો પ્રકાર:' : 'Type of Obstruction:'}
                </label>
                <select
                  value={blockageType}
                  onChange={(e) => setBlockageType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="illegal_parking">
                    {lang === 'gu' ? 'ગેરકાયદે પાર્કિંગ (કોરિડોર બ્લોક)' : 'Illegal Parking in Emergency Lane'}
                  </option>
                  <option value="refused_yield">
                    {lang === 'gu' ? 'વાહને રસ્તો આપવાનો ઇનકાર કર્યો' : 'Vehicle Refused to Yield / Give Space'}
                  </option>
                  <option value="breakdown">
                    {lang === 'gu' ? 'વાહન બંધ પડ્યું છે / બ્રેકડાઉન' : 'Broken Down Vehicle in Fast Lane'}
                  </option>
                  <option value="construction">
                    {lang === 'gu' ? 'રસ્તાનું ખોદકામ અથવા કાટમાળ' : 'Construction Debris / Road Cut'}
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  {lang === 'gu' ? 'વાહન નંબર (જો લાગુ પડતો હોય):' : 'Offending Vehicle Number (Optional):'}
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono-nums text-white uppercase focus:outline-none focus:border-rose-500"
                  placeholder="GJ-01-XX-XXXX"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  {lang === 'gu' ? 'વધારાની વિગત:' : 'Additional Details:'}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                  placeholder={lang === 'gu' ? 'ટ્રાફિક સ્થિતિનું વર્ણન કરો...' : 'Describe the obstruction...'}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-950 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{lang === 'gu' ? 'ટ્રાફિક કંટ્રોલ રૂમને મોકલો' : 'Submit to Traffic Command'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">
              {lang === 'gu' ? 'અહેવાલ સફળતાપૂર્વક નોંધાયો!' : 'Blockage Report Dispatched!'}
            </h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              {lang === 'gu'
                ? 'અમદાવાદ ટ્રાફિક પેટ્રોલ વાનને તાત્કાલિક સ્થળ પર રવાના કરવામાં આવી છે અને નજીકની ૧૦૮ એમ્બ્યુલન્સને વૈકલ્પિક લેન સૂચવવામાં આવી છે.'
                : 'Traffic interceptor dispatched. Surrounding ambulances routed to bypass lane.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
