import React from 'react';
import { motion } from 'framer-motion';
import { Award, Landmark, Users, Shield, Star, CheckCircle } from 'lucide-react';

interface Official {
  name: string;
  position: string;
  committee?: string;
  term?: string;
}

const MUNICIPAL_MAYOR: Official = {
  name: 'Hon. Alexis S. Quina',
  position: 'Municipal Mayor',
  committee: 'Local Chief Executive • Municipal Tourism & Economic Development Board',
};

const MUNICIPAL_VICE_MAYOR: Official = {
  name: 'Hon. Felix H. Borromeo',
  position: 'Municipal Vice Mayor',
  committee: 'Presiding Officer • Sangguniang Bayan',
};

const SANGGUNIANG_BAYAN_MEMBERS: Official[] = [
  {
    name: 'Hon. John M. Romualdo',
    position: 'SB Member (Councilor)',
    committee: 'Committee on Tourism, Culture & Heritage Arts',
  },
  {
    name: 'Hon. Cristina Teresa M. Ociones',
    position: 'SB Member (Councilor)',
    committee: 'Committee on Social Services, Women & Family Welfare',
  },
  {
    name: 'Hon. Jesus M. Banaag',
    position: 'SB Member (Councilor)',
    committee: 'Committee on Agriculture & Fisheries Resources',
  },
  {
    name: 'Hon. Helen P. Mabao',
    position: 'SB Member (Councilor)',
    committee: 'Committee on Health, Sanitation & Public Safety',
  },
  {
    name: 'Hon. Alvin A. Edades',
    position: 'SB Member (Councilor)',
    committee: 'Committee on Infrastructure & Public Works',
  },
  {
    name: 'Hon. Adonis J. Gayramon',
    position: 'SB Member (Councilor)',
    committee: 'Committee on Environmental Protection & Natural Resources',
  },
  {
    name: 'Hon. Crisogono G. Llido Jr.',
    position: 'SB Member (Councilor)',
    committee: 'Committee on Trade, Commerce & Industry',
  },
  {
    name: 'Hon. Ligaya B. Aganap',
    position: 'SB Member (Councilor)',
    committee: 'Committee on Education & Youth Development',
  },
];

export const LGUOfficialsSection: React.FC = () => {
  return (
    <section className="py-20 bg-[#FFFAF0] border-t border-amber-900/10 text-slate-900 relative" id="lgu-officials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Landmark className="w-3.5 h-3.5 text-emerald-700" />
            <span>Municipal Governance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            LGU Officials of Balingasag
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            The dedicated municipal leadership steering sustainable ecotourism, Spanish colonial heritage preservation,
            and community progress for all 30 barangays of Balingasag, Misamis Oriental.
          </p>
        </motion.div>

        {/* Executive Leadership: Mayor & Vice Mayor */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Mayor Card */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wider">
                  Local Chief Executive
                </span>
                <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Executive Branch</span>
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {MUNICIPAL_MAYOR.name}
              </h3>
              <p className="text-sm font-bold text-emerald-700 mt-1">
                {MUNICIPAL_MAYOR.position}
              </p>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {MUNICIPAL_MAYOR.committee}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Office of the Municipal Mayor</span>
              <span>Balingasag, Misamis Oriental</span>
            </div>
          </motion.div>

          {/* Vice Mayor Card */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-slate-800 text-white text-[11px] font-black uppercase tracking-wider">
                  Legislative Presiding Officer
                </span>
                <span className="text-xs text-slate-700 font-bold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-700" />
                  <span>Legislative Branch</span>
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {MUNICIPAL_VICE_MAYOR.name}
              </h3>
              <p className="text-sm font-bold text-slate-700 mt-1">
                {MUNICIPAL_VICE_MAYOR.position}
              </p>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {MUNICIPAL_VICE_MAYOR.committee}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Office of the Vice Mayor</span>
              <span>Sangguniang Bayan</span>
            </div>
          </motion.div>
        </div>

        {/* Sangguniang Bayan Councilors Header */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 text-slate-800 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-slate-600" />
            <span>Sangguniang Bayan Members (Municipal Councilors)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            The Municipal Council of Balingasag
          </h3>
        </div>

        {/* Councilors Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SANGGUNIANG_BAYAN_MEMBERS.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ delay: (idx % 4) * 0.1 }}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs mb-3">
                  #{idx + 1}
                </div>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                  {member.name}
                </h4>
                <p className="text-xs font-bold text-emerald-700 mt-1">
                  {member.position}
                </p>
                {member.committee && (
                  <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed">
                    {member.committee}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-400">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>Elected Sangguniang Bayan</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
