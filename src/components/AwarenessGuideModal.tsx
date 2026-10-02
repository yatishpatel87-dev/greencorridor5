import React from 'react';
import { X, ShieldCheck, Heart, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface AwarenessGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'gu' | 'en';
}

export const AwarenessGuideModal: React.FC<AwarenessGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {lang === 'gu' ? '૧૦૮ એમ્બ્યુલન્સ: રસ્તો આપવાના સોનેરી નિયમો' : 'Golden Rules to Yield for 108 Ambulance'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'gu' ? 'એક સેકન્ડની બચત એક કિંમતી જિંદગી બચાવી શકે છે' : 'Every second saved can save a precious human life'}
            </p>
          </div>
        </div>

        <div className="space-y-4 my-5 text-xs text-slate-300">
          {/* Rule 1 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
              ૧
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {lang === 'gu' ? 'હંમેશા ડાબી બાજુ વળો (Move to the Left)' : 'Always Pull to the Left Lane'}
              </h4>
              <p className="text-slate-400 mt-1 leading-relaxed">
                {lang === 'gu'
                  ? 'ભારતીય ટ્રાફિક નિયમો મુજબ, એમ્બ્યુલન્સ માટે ઝડપી લેન (જમણી અને મધ્યમ લેન) મુક્ત કરવી ફરજિયાત છે. તમારું વાહન ડાબી બાજુ સુરક્ષિત રીતે ખસેડો.'
                  : 'As per Indian road regulations, ambulances use the right and center corridors. Always indicate and safely shift to the left curb.'}
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
              ૨
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {lang === 'gu' ? 'રેડ સિગ્નલ પર આગળ વધવાની છૂટ' : 'Yield Even at Traffic Signals'}
              </h4>
              <p className="text-slate-400 mt-1 leading-relaxed">
                {lang === 'gu'
                  ? 'જો તમે ટ્રાફિક સિગ્નલ પર ઊભા હોવ અને પાછળ એમ્બ્યુલન્સ આવે, તો સાવચેતીપૂર્વક આગળ વધી ડાબે ખસો જેથી એમ્બ્યુલન્સ નીકળી શકે. આ માટે ટ્રાફિક દંડ થતો નથી.'
                  : 'If stuck at a red signal with an ambulance behind, you are permitted to carefully cross the stop line and shift left to let it pass.'}
              </p>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
              ૩
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {lang === 'gu' ? 'એમ્બ્યુલન્સની પાછળ રેસ ન લગાવો' : 'Never Tailgate or Chase the Ambulance'}
              </h4>
              <p className="text-slate-400 mt-1 leading-relaxed">
                {lang === 'gu'
                  ? 'ઘણા વાહનચાલકો એમ્બ્યુલન્સની પાછળ ઝડપથી ગાડી ચલાવી ટ્રાફિકમાંથી નીકળવાનો પ્રયાસ કરે છે, જે ગંભીર અકસ્માત સર્જી શકે છે. ઓછામાં ઓછું ૫૦ મીટર અંતર રાખો.'
                  : 'Never draft or tailgate behind an emergency vehicle. Maintain a minimum safe distance of 50 meters at all times.'}
              </p>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
              ૪
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {lang === 'gu' ? 'કાયદાકીય દંડ: મોટર વાહન અધિનિયમ કલમ ૧૯૪E' : 'Legal Penalty Under Section 194E'}
              </h4>
              <p className="text-slate-400 mt-1 leading-relaxed">
                {lang === 'gu'
                  ? 'મોટર વાહન અધિનિયમની કલમ ૧૯૪E હેઠળ, એમ્બ્યુલન્સ અથવા ફાયર ટેન્ડરને રસ્તો ન આપવા બદલ ₹૧૦,૦૦૦ સુધીનો દંડ અને ૬ મહિના સુધીની જેલની સજાની કડક જોગવાઈ છે.'
                  : 'Failing to yield right of way to emergency vehicles invites a direct ₹10,000 fine and up to 6 months imprisonment.'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
        >
          {lang === 'gu' ? 'સમજાયું - બંધ કરો' : 'Understood - Close Guide'}
        </button>
      </div>
    </div>
  );
};
