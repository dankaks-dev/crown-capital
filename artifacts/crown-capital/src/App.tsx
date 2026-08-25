import { type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowUpRight, BarChart3, Check, ChevronRight, Compass, Globe2, Layers3, Menu, MoveUpRight, Plus, ShieldCheck, WalletCards, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

function useReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3" data-testid="brand-crown-capital">
      <div className={`relative flex h-9 w-9 items-center justify-center border ${light ? 'border-[#d6ad62]' : 'border-[#b88a44]'}`}>
        <span className={`font-display text-[22px] leading-none ${light ? 'text-[#d6ad62]' : 'text-[#b88a44]'}`}>C</span>
        <span className={`absolute -bottom-1 -right-1 h-2 w-2 ${light ? 'bg-[#d6ad62]' : 'bg-[#b88a44]'}`} />
      </div>
      <div className={`font-mono-crown text-[11px] font-bold uppercase tracking-[0.18em] ${light ? 'text-[#f4ecdc]' : 'text-[#143c3a]'}`}>
        Crown <span className={light ? 'text-[#d6ad62]' : 'text-[#b88a44]'}>Capital</span>
      </div>
    </div>
  );
}

function SectionLabel({ number, children, light = false }: { number: string; children: string; light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 font-mono-crown text-[10px] font-bold uppercase tracking-[0.22em] ${light ? 'text-[#cfa75e]' : 'text-[#a47738]'}`} data-testid={`label-${number}`}>
      <span>{number}</span>
      <span className={`h-px w-8 ${light ? 'bg-[#cfa75e]/60' : 'bg-[#b88a44]/60'}`} />
      <span className={light ? 'text-[#c8d2c7]' : 'text-[#6c8176]'}>{children}</span>
    </div>
  );
}

function AppDialog({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102f2d]/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="dialog-title" data-testid="dialog-private-conversation">
      <div className="relative w-full max-w-lg border border-[#d6ad62]/40 bg-[#f6f1e8] p-7 shadow-2xl sm:p-10">
        <button type="button" onClick={onClose} aria-label="Close dialog" className="absolute right-5 top-5 text-[#557268] transition-colors hover:text-[#143c3a]" data-testid="button-close-dialog">
          <X size={19} strokeWidth={1.5} />
        </button>
        {!sent ? (
          <>
            <SectionLabel number="C" >A considered first step</SectionLabel>
            <h2 id="dialog-title" className="mt-6 max-w-sm font-display text-4xl leading-[.98] text-[#143c3a] sm:text-5xl">A clearer future starts with a conversation.</h2>
            <p className="mt-5 max-w-md text-sm leading-6 text-[#557268]">Tell us where you are today. A member of our team will be in touch within one business day.</p>
            <form className="mt-8 space-y-4" onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
              <label className="block">
                <span className="font-mono-crown text-[10px] uppercase tracking-[.18em] text-[#557268]">Your email</span>
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@yourdomain.com" className="mt-2 w-full border-b border-[#b8b9a6] bg-transparent px-0 py-3 text-[#143c3a] outline-none placeholder:text-[#9ca99d] focus:border-[#b88a44]" data-testid="input-conversation-email" />
              </label>
              <button type="submit" className="shine mt-3 flex w-full items-center justify-between bg-[#143c3a] px-5 py-4 text-left text-sm font-semibold text-[#f6f1e8] transition-colors hover:bg-[#1e504b]" data-testid="button-submit-conversation">
                Request a private conversation <ArrowUpRight size={17} />
              </button>
            </form>
          </>
        ) : (
          <div className="py-8">
            <div className="flex h-12 w-12 items-center justify-center bg-[#d6ad62] text-[#143c3a]"><Check size={24} /></div>
            <h2 className="mt-7 font-display text-5xl leading-none text-[#143c3a]">We’ll be in touch.</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#557268]">Your note is with our team. Expect a thoughtful reply within one business day.</p>
            <button type="button" onClick={onClose} className="mt-8 inline-flex items-center gap-2 border-b border-[#b88a44] pb-1 text-sm font-semibold text-[#143c3a]" data-testid="button-finish-dialog">Return to Crown Capital <ArrowUpRight size={15} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  useReveal();

  const openConversation = () => {
    setDialogOpen(true);
    setMenuOpen(false);
  };
  const navigateTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const faqs = [
    ['What kind of clients does Crown Capital work with?', 'We work with people at meaningful inflection points: building a business, receiving liquidity, stepping into leadership, or simply ready to make their financial life more intentional. We look for a long-term relationship, not a single transaction.'],
    ['How do you invest on my behalf?', 'Every strategy is built around your actual life, not a model portfolio. We combine global public markets, carefully selected private opportunities, and a disciplined liquidity framework. You always know what you own and why.'],
    ['What makes Crown Capital different?', 'We are deliberately small. That means fewer layers between you and the person making decisions, more context held by your team, and advice that can evolve as your life does.'],
    ['What is the minimum to begin?', 'There is no single number that tells us whether a relationship is right. We consider complexity, ambition, and fit alongside investable assets. The best first step is a private conversation.'],
  ];

  return (
    <div className="grain min-h-[100dvh] bg-[#f6f1e8] text-[#143c3a]">
      {dialogOpen && <AppDialog onClose={() => setDialogOpen(false)} />}
      <div className="fixed left-0 top-0 z-30 h-0.5 bg-[#b88a44] transition-all duration-300" style={{ width: '22%' }} />

      <header className="absolute left-0 right-0 top-0 z-20">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-6 lg:px-10">
          <button type="button" onClick={() => navigateTo('top')} data-testid="button-home-brand"><BrandMark /></button>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            <button type="button" onClick={() => navigateTo('approach')} className="font-mono-crown text-[10px] uppercase tracking-[.18em] text-[#557268] transition-colors hover:text-[#143c3a]" data-testid="link-approach">Our approach</button>
            <button type="button" onClick={() => navigateTo('perspective')} className="font-mono-crown text-[10px] uppercase tracking-[.18em] text-[#557268] transition-colors hover:text-[#143c3a]" data-testid="link-perspective">Perspective</button>
            <button type="button" onClick={() => navigateTo('faq')} className="font-mono-crown text-[10px] uppercase tracking-[.18em] text-[#557268] transition-colors hover:text-[#143c3a]" data-testid="link-faq">FAQ</button>
            <button type="button" onClick={openConversation} className="group flex items-center gap-2 border-b border-[#b88a44] pb-1 font-mono-crown text-[10px] uppercase tracking-[.18em] text-[#143c3a]" data-testid="button-nav-conversation">
              Begin a conversation <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </nav>
          <button type="button" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-y border-[#d8d1c3] bg-[#f6f1e8] px-6 py-5 md:hidden" data-testid="mobile-navigation">
            <div className="flex flex-col gap-5">
              <button type="button" onClick={() => navigateTo('approach')} className="text-left font-mono-crown text-[11px] uppercase tracking-[.18em]" data-testid="mobile-link-approach">Our approach</button>
              <button type="button" onClick={() => navigateTo('perspective')} className="text-left font-mono-crown text-[11px] uppercase tracking-[.18em]" data-testid="mobile-link-perspective">Perspective</button>
              <button type="button" onClick={() => navigateTo('faq')} className="text-left font-mono-crown text-[11px] uppercase tracking-[.18em]" data-testid="mobile-link-faq">FAQ</button>
              <button type="button" onClick={openConversation} className="flex items-center gap-2 text-left font-mono-crown text-[11px] uppercase tracking-[.18em] text-[#a47738]" data-testid="mobile-button-conversation">Begin a conversation <ArrowUpRight size={15} /></button>
            </div>
          </div>
        )}
      </header>

      <main id="top">
        <section className="relative min-h-[730px] overflow-hidden border-b border-[#d8d1c3] lg:min-h-[790px]">
          <div className="hero-grid absolute inset-0 opacity-70" />
          <div className="absolute -right-20 top-20 h-[500px] w-[500px] rounded-full bg-[#dfc58f]/25 blur-3xl" />
          <div className="relative mx-auto grid min-h-[730px] max-w-[1320px] grid-cols-1 items-center gap-12 px-6 pb-20 pt-36 lg:min-h-[790px] lg:grid-cols-[1.12fr_.88fr] lg:gap-10 lg:px-10 lg:pb-12 lg:pt-28">
            <div className="relative z-10 max-w-3xl">
              <div className="reveal"><SectionLabel number="01">Private wealth, thoughtfully held</SectionLabel></div>
              <h1 className="reveal delay-1 mt-7 max-w-[760px] font-display text-[clamp(4.4rem,9vw,8.9rem)] leading-[.82] tracking-[-.055em] text-[#143c3a]" data-testid="text-hero-title">
                Your wealth.<br /><em className="text-[#a47738]">A longer view.</em>
              </h1>
              <p className="reveal delay-2 mt-9 max-w-[470px] text-[17px] leading-7 text-[#557268]" data-testid="text-hero-description">
                Crown Capital is an independent investment partner for people building something that should last.
              </p>
              <div className="reveal delay-3 mt-9 flex flex-wrap items-center gap-6">
                <button type="button" onClick={openConversation} className="shine group flex items-center gap-5 bg-[#143c3a] px-6 py-4 text-sm font-semibold text-[#f6f1e8] transition-colors hover:bg-[#1f514d]" data-testid="button-hero-conversation">
                  Begin a private conversation <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </button>
                <button type="button" onClick={() => navigateTo('approach')} className="group flex items-center gap-2 text-sm font-semibold text-[#143c3a]" data-testid="button-hero-approach">
                  How we think <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
            <div className="relative hidden h-[430px] lg:block">
              <div className="absolute right-0 top-1/2 h-[410px] w-[330px] -translate-y-1/2 rotate-3 border border-[#b88a44]/50 bg-[#143c3a] p-3 shadow-xl">
                <div className="relative flex h-full flex-col justify-between overflow-hidden border border-[#d6ad62]/25 p-7">
                  <div className="absolute -right-16 top-16 h-72 w-72 rounded-full border border-[#d6ad62]/30" />
                  <div className="absolute -right-6 top-26 h-56 w-56 rounded-full border border-[#d6ad62]/20" />
                  <div className="relative flex items-start justify-between">
                    <BrandMark light />
                    <span className="font-mono-crown text-[9px] uppercase tracking-[.18em] text-[#c8d2c7]">Est. 2008</span>
                  </div>
                  <div className="relative">
                    <div className="font-mono-crown text-[9px] uppercase tracking-[.18em] text-[#cfa75e]">A private wealth office</div>
                    <div className="mt-4 font-display text-5xl leading-[.9] text-[#f4ecdc]">Built for<br /><em className="text-[#d6ad62]">the long arc.</em></div>
                  </div>
                  <div className="relative flex items-end justify-between border-t border-[#d6ad62]/25 pt-4">
                    <span className="font-mono-crown text-[9px] uppercase tracking-[.16em] text-[#c8d2c7]">New York · London<br />Everywhere considered</span>
                    <span className="font-display text-3xl text-[#d6ad62]">C</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 flex h-24 w-44 -rotate-6 flex-col justify-between border border-[#d8d1c3] bg-[#f6f1e8] p-4 shadow-lg">
                <div className="flex items-center justify-between"><span className="font-mono-crown text-[9px] uppercase tracking-widest text-[#557268]">The view</span><MoveUpRight size={13} className="text-[#a47738]" /></div>
                <span className="font-display text-2xl text-[#143c3a]">Long-term, by design.</span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-7 left-6 hidden items-center gap-3 lg:flex">
            <span className="h-8 w-px bg-[#b88a44]" /><span className="font-mono-crown text-[9px] uppercase tracking-[.2em] text-[#557268]">Scroll to explore</span>
          </div>
        </section>

        <section className="border-b border-[#d8d1c3] bg-[#ece6db]" aria-label="Crown Capital principles">
          <div className="mx-auto grid max-w-[1320px] grid-cols-2 lg:grid-cols-4">
            {[
              ['12', 'countries invested across'],
              ['17', 'years of independent thinking'],
              ['1', 'team on your side'],
              ['∞', 'reasons to stay curious'],
            ].map(([value, label], index) => (
              <div className={`reveal delay-${index + 1} border-r border-[#d8d1c3] px-6 py-7 last:border-r-0 lg:px-10`} key={label} data-testid={`stat-${index}`}>
                <div className="font-display text-4xl text-[#143c3a]">{value}</div>
                <div className="mt-1 max-w-[130px] font-mono-crown text-[9px] uppercase leading-4 tracking-[.14em] text-[#6b8175]">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="approach" className="relative overflow-hidden bg-[#143c3a] py-24 text-[#f4ecdc] lg:py-36">
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(115deg, transparent 0, transparent 27px, #d6ad62 28px, transparent 29px)' }} />
          <div className="relative mx-auto grid max-w-[1320px] gap-16 px-6 lg:grid-cols-[.76fr_1.24fr] lg:gap-24 lg:px-10">
            <div className="reveal">
              <SectionLabel number="02" light>Our approach</SectionLabel>
              <h2 className="mt-7 max-w-sm font-display text-5xl leading-[.92] tracking-[-.035em] sm:text-6xl">The calm that comes from knowing.</h2>
              <p className="mt-7 max-w-xs text-sm leading-6 text-[#b6c5b9]">Good advice should make the important feel clearer. We bring patient thinking to the noisy parts of wealth.</p>
              <button type="button" onClick={() => navigateTo('perspective')} className="group mt-9 flex items-center gap-3 border-b border-[#cfa75e] pb-2 text-sm font-semibold text-[#f4ecdc]" data-testid="button-approach-perspective">See our perspective <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></button>
            </div>
            <div className="grid gap-0 border-t border-[#b3c4b4]/25 sm:grid-cols-2">
              {[
                [Compass, 'Start with context', 'Before we discuss a single investment, we understand the life around it. Your ambitions, your obligations, and what enough looks like.'],
                [Layers3, 'Build with intention', 'A portfolio is a living architecture. We balance resilience today with the freedom to pursue what comes next.'],
                [ShieldCheck, 'Hold the line', 'Conviction is more useful than reaction. We stay close to the facts, remain available, and protect your attention.'],
                [WalletCards, 'Make it human', 'You should never need a decoder ring. We explain the why, tell you what changed, and answer the question behind the question.'],
              ].map(([Icon, title, copy], index) => {
                const FeatureIcon = Icon as typeof Compass;
                return (
                  <div className={`reveal delay-${(index % 4) + 1} group border-b border-[#b3c4b4]/25 p-7 first:pl-0 sm:nth-[odd]:border-r sm:nth-[odd]:pl-0 sm:nth-[even]:pr-0 lg:p-10 lg:first:pt-10`} key={title as string} data-testid={`approach-card-${index}`}>
                    <FeatureIcon size={24} strokeWidth={1.2} className="text-[#d6ad62] transition-transform duration-500 group-hover:-translate-y-1" />
                    <h3 className="mt-7 font-display text-3xl text-[#f4ecdc]">{title as string}</h3>
                    <p className="mt-4 max-w-xs text-sm leading-6 text-[#b6c5b9]">{copy as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#f6f1e8] py-24 lg:py-36">
          <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
            <div className="reveal flex flex-col justify-between gap-8 border-b border-[#d8d1c3] pb-10 lg:flex-row lg:items-end">
              <div><SectionLabel number="03">An operating view</SectionLabel><h2 className="mt-7 max-w-xl font-display text-5xl leading-[.95] tracking-[-.03em] sm:text-6xl">See the whole picture.<br /><em className="text-[#a47738]">Not just the market.</em></h2></div>
              <p className="max-w-xs text-sm leading-6 text-[#557268]">One intelligent view of your investments, your liquidity, and the decisions that matter next.</p>
            </div>
            <div className="mt-14 grid gap-7 lg:grid-cols-[1.45fr_.75fr]">
              <div className="reveal delay-1 border border-[#d8d1c3] bg-[#ece6db] p-5 sm:p-8" data-testid="card-portfolio-view">
                <div className="flex items-start justify-between">
                  <div><span className="font-mono-crown text-[9px] uppercase tracking-[.18em] text-[#6b8175]">Private client view</span><div className="mt-2 font-display text-3xl text-[#143c3a]">The Whitmore family office</div></div>
                  <span className="flex items-center gap-1.5 font-mono-crown text-[9px] uppercase tracking-[.13em] text-[#557268]"><span className="h-1.5 w-1.5 rounded-full bg-[#6b9273]" /> Live view</span>
                </div>
                <div className="mt-10 grid gap-8 sm:grid-cols-[.8fr_1.2fr]">
                  <div><div className="font-mono-crown text-[9px] uppercase tracking-[.14em] text-[#6b8175]">Total invested</div><div className="mt-2 font-display text-4xl text-[#143c3a]">$4,286,190</div><div className="mt-3 flex items-center gap-2 text-xs text-[#568067]"><ArrowUpRight size={14} /> 8.42% this year</div><div className="mt-10 grid grid-cols-2 gap-4 border-t border-[#d8d1c3] pt-4"><div><div className="font-mono-crown text-[9px] uppercase tracking-wider text-[#6b8175]">Liquidity</div><div className="mt-1 text-lg font-semibold text-[#143c3a]">$482,900</div></div><div><div className="font-mono-crown text-[9px] uppercase tracking-wider text-[#6b8175]">Next review</div><div className="mt-1 text-lg font-semibold text-[#143c3a]">14 Oct</div></div></div></div>
                  <div className="relative min-h-[210px] border-l border-b border-[#c9c8b7] p-3"><div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(#d8d1c3 1px, transparent 1px), linear-gradient(90deg, #d8d1c3 1px, transparent 1px)', backgroundSize: '25% 25%' }} /><svg viewBox="0 0 500 205" className="relative h-full w-full overflow-visible" preserveAspectRatio="none" aria-label="Portfolio growth chart"><path d="M0 173 C43 165 53 157 81 162 S123 141 151 148 S189 127 215 137 S252 107 279 116 S315 96 342 101 S382 73 409 81 S454 48 500 31" fill="none" stroke="#143c3a" strokeWidth="3" /><path d="M0 173 C43 165 53 157 81 162 S123 141 151 148 S189 127 215 137 S252 107 279 116 S315 96 342 101 S382 73 409 81 S454 48 500 31 L500 205 L0 205Z" fill="#c7a45d" opacity=".13" /><circle cx="500" cy="31" r="5" fill="#b88a44" /><text x="430" y="20" fill="#a47738" fontSize="10" fontFamily="Space Mono">+8.42%</text></svg><div className="absolute -bottom-6 left-0 right-0 flex justify-between font-mono-crown text-[8px] uppercase tracking-wider text-[#8a978a]"><span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span></div></div>
                </div>
              </div>
              <div className="reveal delay-2 flex flex-col justify-between bg-[#cfa75e] p-7 text-[#143c3a] sm:p-8">
                <div><BarChart3 size={25} strokeWidth={1.3} /><h3 className="mt-9 max-w-[230px] font-display text-4xl leading-[.95]">Clarity is a compounding advantage.</h3></div>
                <div className="mt-14 border-t border-[#143c3a]/25 pt-5"><p className="text-sm leading-6">Your capital should make your world feel larger, not your admin heavier.</p><button type="button" onClick={openConversation} className="mt-6 flex items-center gap-2 text-sm font-semibold" data-testid="button-dashboard-conversation">See what that feels like <ArrowUpRight size={16} /></button></div>
              </div>
            </div>
          </div>
        </section>

        <section id="perspective" className="border-y border-[#d8d1c3] bg-[#ece6db] py-24 lg:py-32">
          <div className="mx-auto grid max-w-[1320px] gap-14 px-6 lg:grid-cols-[.7fr_1.3fr] lg:px-10">
            <div className="reveal"><SectionLabel number="04">The Crown perspective</SectionLabel><h2 className="mt-7 max-w-sm font-display text-5xl leading-[.92] sm:text-6xl">What we’re thinking about.</h2><p className="mt-6 max-w-xs text-sm leading-6 text-[#557268]">Ideas worth keeping close. Notes from the desk of an independent wealth partner.</p><button type="button" onClick={() => setActiveFaq(0)} className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#143c3a]" data-testid="button-perspective-notes">Explore our notes <ArrowUpRight size={16} /></button></div>
            <div className="grid gap-0 border-t border-[#c9c8b7]">
              {[
                ['Field note  /  06.24', 'The case for keeping a little powder dry', 'Liquidity is not a failure to invest. It is the freedom to act when the right moment arrives.'],
                ['Conversation  /  05.24', 'What ambitious people actually want from advice', 'Less performance theatre. More context, candour, and someone who remembers what you said last year.'],
                ['Long view  /  04.24', 'The quiet power of an unhurried decision', 'The best investment decisions rarely announce themselves. They accumulate in the background.'],
              ].map(([meta, title, copy], index) => (
                <button type="button" onClick={openConversation} className={`reveal delay-${index + 1} group grid gap-5 border-b border-[#c9c8b7] py-7 text-left transition-colors hover:bg-[#e4ddcf] sm:grid-cols-[.33fr_1fr] sm:gap-8 sm:py-9`} key={title} data-testid={`article-${index}`}>
                  <span className="font-mono-crown text-[9px] uppercase tracking-[.14em] text-[#a47738]">{meta}</span><span><span className="flex items-start justify-between gap-4 font-display text-3xl leading-none text-[#143c3a] sm:text-4xl">{title}<ArrowUpRight size={20} className="mt-1 shrink-0 text-[#a47738] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></span><span className="mt-4 block max-w-lg text-sm leading-6 text-[#557268]">{copy}</span></span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f6f1e8] py-24 lg:py-36">
          <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
            <div className="reveal"><SectionLabel number="05">A different kind of relationship</SectionLabel><div className="mt-8 grid gap-8 lg:grid-cols-[1fr_.8fr] lg:items-end"><h2 className="max-w-2xl font-display text-5xl leading-[.9] tracking-[-.035em] sm:text-7xl">You bring the ambition.<br /><em className="text-[#a47738]">We bring the perspective.</em></h2><p className="max-w-sm text-sm leading-6 text-[#557268]">A small, senior team that knows your context, challenges your assumptions, and stays for the long term.</p></div></div>
            <div className="mt-16 grid border-y border-[#d8d1c3] lg:grid-cols-3">
              {[['01', 'Senior by default', 'Your relationship is led by people who have sat on both sides of the table. No hand-offs to a junior team.'], ['02', 'Independent by design', 'No house products. No quarterly sales targets. Just the freedom to recommend what genuinely fits.'], ['03', 'Human in the detail', 'The big decisions matter. So do the smaller ones that make your financial life feel lighter.']].map(([number, title, copy], index) => (
                <div className={`reveal delay-${index + 1} border-b border-[#d8d1c3] p-7 last:border-b-0 sm:p-10 lg:border-b-0 lg:border-r lg:last:border-r-0`} key={number} data-testid={`relationship-${number}`}>
                  <span className="font-mono-crown text-[10px] tracking-[.16em] text-[#a47738]">{number}</span><h3 className="mt-14 font-display text-3xl leading-none text-[#143c3a]">{title}</h3><p className="mt-5 max-w-xs text-sm leading-6 text-[#557268]">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="bg-[#143c3a] py-24 text-[#f4ecdc] lg:py-32">
          <div className="mx-auto grid max-w-[1320px] gap-14 px-6 lg:grid-cols-[.72fr_1.28fr] lg:px-10">
            <div className="reveal"><SectionLabel number="06" light>A considered first step</SectionLabel><h2 className="mt-7 max-w-sm font-display text-5xl leading-[.92] sm:text-6xl">Questions, answered plainly.</h2><p className="mt-6 max-w-xs text-sm leading-6 text-[#b6c5b9]">If your question isn’t here, it’s likely the right one to ask us directly.</p><button type="button" onClick={openConversation} className="mt-8 flex items-center gap-2 border-b border-[#cfa75e] pb-2 text-sm font-semibold" data-testid="button-faq-conversation">Ask us something else <ArrowUpRight size={16} /></button></div>
            <div className="reveal delay-1 border-t border-[#b3c4b4]/25">
              {faqs.map(([question, answer], index) => {
                const open = activeFaq === index;
                return <div className="border-b border-[#b3c4b4]/25" key={question}><button type="button" onClick={() => setActiveFaq(open ? null : index)} className="flex w-full items-center justify-between gap-5 py-6 text-left" aria-expanded={open} data-testid={`button-faq-${index}`}><span className="font-display text-2xl leading-none sm:text-3xl">{question}</span>{open ? <X size={18} className="shrink-0 text-[#d6ad62]" /> : <Plus size={18} className="shrink-0 text-[#d6ad62]" />}</button>{open && <p className="max-w-2xl pb-7 pr-8 text-sm leading-6 text-[#b6c5b9]" data-testid={`answer-faq-${index}`}>{answer}</p>}</div>;
              })}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#cfa75e] py-24 text-[#143c3a] lg:py-32">
          <div className="absolute -right-16 -top-24 font-display text-[340px] leading-none text-[#143c3a]/[.06]">C</div>
          <div className="relative mx-auto max-w-[1320px] px-6 lg:px-10"><div className="reveal max-w-3xl"><SectionLabel number="07">The next chapter</SectionLabel><h2 className="mt-7 font-display text-6xl leading-[.85] tracking-[-.04em] sm:text-8xl">Make room<br /><em>for what’s next.</em></h2><p className="mt-8 max-w-md text-base leading-7 text-[#31514a]">The right partner does more than manage capital. They help you see possibility with a little more clarity.</p><button type="button" onClick={openConversation} className="shine mt-9 flex items-center gap-5 bg-[#143c3a] px-6 py-4 text-sm font-semibold text-[#f6f1e8] transition-colors hover:bg-[#1f514d]" data-testid="button-final-conversation">Begin a private conversation <ArrowUpRight size={17} /></button></div></div>
        </section>
      </main>

      <footer className="bg-[#102f2d] py-10 text-[#c8d2c7]">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-6 lg:grid-cols-[1fr_auto_auto] lg:items-end lg:px-10">
          <div><BrandMark light /><p className="mt-6 max-w-xs text-xs leading-5 text-[#91a99a]">Independent wealth advice for people building what lasts.</p></div>
          <div className="flex flex-col gap-3 font-mono-crown text-[9px] uppercase tracking-[.16em] text-[#91a99a]"><button type="button" onClick={() => navigateTo('approach')} className="text-left hover:text-[#d6ad62]" data-testid="footer-link-approach">Our approach</button><button type="button" onClick={() => navigateTo('perspective')} className="text-left hover:text-[#d6ad62]" data-testid="footer-link-perspective">Perspective</button><button type="button" onClick={() => navigateTo('faq')} className="text-left hover:text-[#d6ad62]" data-testid="footer-link-faq">FAQ</button></div>
          <div className="flex flex-col gap-3 font-mono-crown text-[9px] uppercase tracking-[.16em] text-[#91a99a]"><button type="button" onClick={openConversation} className="flex items-center gap-2 text-left hover:text-[#d6ad62]" data-testid="footer-button-contact">Contact <ArrowUpRight size={12} /></button><span className="flex items-center gap-2"><Globe2 size={12} /> New York · London</span><span className="text-[#607c6e]">© 2025 Crown Capital</span></div>
        </div>
      </footer>
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;