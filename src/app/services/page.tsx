import Link from 'next/link';
import BlurText from '@/components/ui/BlurText';
import ScrollReveal from '@/components/ui/ScrollReveal';
import TiltedCard from '@/components/ui/TiltedCard';
import { services } from '@/data/services';

export default function ServicesPage() {
  return (
    <main className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Heading */}
        <BlurText
          text="Services"
          className="text-5xl sm:text-6xl font-bold text-slate-100 mb-3"
          delay={60}
        />
        <ScrollReveal delay={0.15}>
          <p className="text-slate-400 text-lg max-w-xl mb-14">
            Security-first work across the full Web3 stack, from smart contracts
            to infrastructure.
          </p>
        </ScrollReveal>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <ScrollReveal key={service.id} delay={i * 0.1} direction="up">
              <TiltedCard className="h-full" rotateAmplitude={5}>
                <div className="flex flex-col h-full p-7 rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-sm">

                  {/* Icon + title */}
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h2 className="text-xl font-bold text-slate-100 mb-3">{service.title}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">{service.description}</p>

                  {/* Includes list */}
                  <ul className="space-y-2 mb-6 flex-1">
                    {service.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-0.5 text-indigo-400 shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href="/contact"
                    className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/60 bg-indigo-600/20 px-5 py-2.5 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-600/40 hover:border-indigo-400 hover:text-indigo-200"
                  >
                    {service.cta} →
                  </Link>
                </div>
              </TiltedCard>
            </ScrollReveal>
          ))}
        </div>

        {/* Bottom CTA */}
        <ScrollReveal delay={0.2} className="mt-16 text-center">
          <p className="text-slate-400 mb-4">
            Not sure which service fits your needs?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 bg-indigo-600 hover:bg-indigo-500 transition text-base font-semibold text-white shadow-lg shadow-indigo-900/40"
          >
            Let&apos;s Talk
          </Link>
        </ScrollReveal>

      </div>
    </main>
  );
}
