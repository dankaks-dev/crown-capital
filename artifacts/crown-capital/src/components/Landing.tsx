import React from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileText,
  Home,
  Image as ImageIcon,
  MapPin,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import "./HomeVault.css";

type LandingProps = {
  onSignIn: () => void;
  onGetStarted: () => void;
};

const features = [
  {
    icon: Clock3,
    eyebrow: "01 / Maintenance",
    title: "Every job. Properly recorded.",
    text: "Log repairs, improvements and upkeep as they happen, with the room, cost, photos and date attached.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "02 / Compliance",
    title: "Keep the paperwork with the property.",
    text: "Store Gas Safe records, FENSA certificates, EICRs, warranties and other documents with expiry reminders.",
  },
  {
    icon: FileText,
    eyebrow: "03 / Sale dossier",
    title: "Turn years of records into evidence.",
    text: "Create a surveyor-ready PDF organised by room and system, with verified work clearly separated from self-reported records.",
  },
  {
    icon: TrendingUp,
    eyebrow: "04 / Value",
    title: "See what improvements may be worth.",
    text: "Project the potential contribution of improvements using UK market data and HM Land Registry price-paid figures.",
  },
  {
    icon: AlertTriangle,
    eyebrow: "05 / Loss exposure",
    title: "See what unresolved issues are costing.",
    text: "Surface outstanding defects and understand the potential exposure before they become more expensive problems.",
  },
  {
    icon: Receipt,
    eyebrow: "06 / Accounting",
    title: "Separate running costs from capital.",
    text: "Tag expenditure as CapEx or OpEx so your property costs stay organised for your accountant.",
  },
];

const pricing = [
  {
    name: "Free",
    price: "£0",
    period: "forever",
    description: "For getting your first property properly organised.",
    features: [
      "1 property",
      "Maintenance log",
      "Photos and receipts",
      "Document storage",
      "Expiry reminders",
    ],
    featured: false,
  },
  {
    name: "HomeVault Pro",
    price: "£5.99",
    period: "per month",
    description: "For homeowners who want a complete property record.",
    features: [
      "Up to 3 properties",
      "Everything in Free",
      "Compliance Vault",
      "Surveyor-Ready PDF Dossier",
      "Value Projector",
      "Loss Exposure view",
    ],
    featured: true,
  },
  {
    name: "HomeVault Portfolio",
    price: "£9.99",
    period: "per month",
    description: "For landlords keeping several properties under control.",
    features: [
      "Unlimited properties",
      "Everything in Pro",
      "CapEx / OpEx tagging",
      "Portfolio-wide records",
      "Property-by-property dossiers",
      "Desktop and mobile access",
    ],
    featured: false,
  },
];

export default function Landing({
  onSignIn,
  onGetStarted,
}: LandingProps) {
  return (
    <main className="hv-page">
      <header className="hv-header">
        <div className="hv-container hv-header-inner">
          <button className="hv-brand" onClick={onGetStarted} aria-label="HomeVault home">
            <span className="hv-brand-mark">
              <Home size={18} strokeWidth={1.8} />
            </span>
            <span>HomeVault</span>
          </button>

          <nav className="hv-nav" aria-label="Primary navigation">
            <a href="#features">Features</a>
            <a href="#dossier">The dossier</a>
            <a href="#pricing">Pricing</a>
          </nav>

          <div className="hv-header-actions">
            <button className="hv-signin" onClick={onSignIn}>
              Sign in
            </button>
            <button className="hv-button hv-button-small" onClick={onGetStarted}>
              Get started
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      <section className="hv-hero">
        <div className="hv-container hv-hero-grid">
          <div className="hv-hero-copy">
            <p className="hv-eyebrow">THE DIGITAL PROPERTY RECORD</p>

            <h1>
              Your property.
              <br />
              Your records.
              <br />
              Your <em>proof.</em>
            </h1>

            <p className="hv-hero-lead">
              Keep a clear record of the work that has been done to your home,
              from the boiler service to the new bathroom. Then take that
              evidence with you when you sell, remortgage or make an insurance
              claim.
            </p>

            <div className="hv-hero-actions">
              <button className="hv-button" onClick={onGetStarted}>
                Start your property record
                <ArrowRight size={17} />
              </button>
              <button className="hv-text-button" onClick={onSignIn}>
                Already have an account
                <ChevronRight size={15} />
              </button>
            </div>

            <div className="hv-hero-note">
              <Check size={15} />
              <span>No paperwork to find. No spreadsheet to maintain.</span>
            </div>
          </div>

          <div className="hv-hero-visual" aria-label="HomeVault property record preview">
            <div className="hv-browser">
              <div className="hv-browser-bar">
                <div className="hv-browser-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="hv-browser-address">homevault.co.uk / property</span>
              </div>

              <div className="hv-dashboard">
                <aside className="hv-dashboard-sidebar">
                  <div className="hv-mini-logo">
                    <span className="hv-mini-mark">
                      <Home size={12} />
                    </span>
                    HomeVault
                  </div>

                  <div className="hv-side-item hv-side-active">
                    <Home size={13} />
                    Overview
                  </div>
                  <div className="hv-side-item">
                    <Wrench size={13} />
                    Maintenance
                  </div>
                  <div className="hv-side-item">
                    <ShieldCheck size={13} />
                    Compliance
                  </div>
                  <div className="hv-side-item">
                    <FileText size={13} />
                    Documents
                  </div>
                </aside>

                <div className="hv-dashboard-main">
                  <div className="hv-dashboard-top">
                    <div>
                      <span className="hv-dashboard-label">PROPERTY RECORD</span>
                      <h3>14 Oakfield Road</h3>
                      <p>Coulsdon, CR5</p>
                    </div>
                    <span className="hv-status">
                      <span />
                      Up to date
                    </span>
                  </div>

                  <div className="hv-stat-grid">
                    <div className="hv-stat-card">
                      <span>RECORDS</span>
                      <strong>47</strong>
                      <small>Since 2019</small>
                    </div>
                    <div className="hv-stat-card">
                      <span>DOCUMENTS</span>
                      <strong>23</strong>
                      <small>3 expiring soon</small>
                    </div>
                    <div className="hv-stat-card">
                      <span>IMPROVEMENTS</span>
                      <strong>£18.4k</strong>
                      <small>Recorded spend</small>
                    </div>
                  </div>

                  <div className="hv-record-panel">
                    <div className="hv-record-heading">
                      <div>
                        <span className="hv-dashboard-label">RECENT RECORDS</span>
                        <h4>Property history</h4>
                      </div>
                      <span className="hv-view-all">View all</span>
                    </div>

                    <div className="hv-record">
                      <div className="hv-record-icon">
                        <Wrench size={14} />
                      </div>
                      <div className="hv-record-content">
                        <strong>Boiler service</strong>
                        <span>Utility room · Gas Safe engineer</span>
                      </div>
                      <div className="hv-record-meta">
                        <strong>£95</strong>
                        <span>14 Aug 2026</span>
                      </div>
                    </div>

                    <div className="hv-record">
                      <div className="hv-record-icon">
                        <Receipt size={14} />
                      </div>
                      <div className="hv-record-content">
                        <strong>Bathroom refurbishment</strong>
                        <span>Main bathroom · Improvement</span>
                      </div>
                      <div className="hv-record-meta">
                        <strong>£4,850</strong>
                        <span>02 Jun 2026</span>
                      </div>
                    </div>

                    <div className="hv-record">
                      <div className="hv-record-icon">
                        <FileCheck2 size={14} />
                      </div>
                      <div className="hv-record-content">
                        <strong>EICR certificate</strong>
                        <span>Electrical · Verified document</span>
                      </div>
                      <div className="hv-record-meta">
                        <strong>Valid</strong>
                        <span>Until May 2031</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hv-floating-card hv-floating-card-top">
              <FileCheck2 size={16} />
              <div>
                <strong>Verified record</strong>
                <span>Gas Safe certificate</span>
              </div>
            </div>

            <div className="hv-floating-card hv-floating-card-bottom">
              <TrendingUp size={16} />
              <div>
                <strong>Value Projector</strong>
                <span>+£12,500 potential contribution</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hv-proof-strip">
        <div className="hv-container hv-proof-inner">
          <p>Built around the evidence that matters</p>
          <div className="hv-proof-items">
            <span>Photos</span>
            <span>Receipts</span>
            <span>Certificates</span>
            <span>Warranties</span>
            <span>Dates</span>
            <span>Costs</span>
          </div>
        </div>
      </section>

      <section className="hv-section hv-section-tint" id="features">
        <div className="hv-container">
          <div className="hv-section-intro">
            <p className="hv-eyebrow">ONE RECORD. YEARS OF HISTORY.</p>
            <h2>
              Stop keeping your property's history
              <br />
              in <em>random places.</em>
            </h2>
            <p>
              HomeVault gives every repair, improvement and document a proper
              place. So when someone asks what was done, when, by whom and for
              how much, you have an answer.
            </p>
          </div>

          <div className="hv-feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article className="hv-feature-card" key={feature.eyebrow}>
                  <div className="hv-feature-icon">
                    <Icon size={19} strokeWidth={1.7} />
                  </div>
                  <span className="hv-feature-eyebrow">{feature.eyebrow}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="hv-section hv-dossier-section" id="dossier">
        <div className="hv-container hv-dossier-grid">
          <div className="hv-dossier-copy">
            <p className="hv-eyebrow">WHEN IT IS TIME TO SELL</p>
            <h2>
              Don't hand over a
              <br />
              box of <em>old paperwork.</em>
            </h2>
            <p>
              Create a single property dossier showing the history of your
              home. Work through it by room or system, with supporting
              documents attached to the relevant records.
            </p>

            <div className="hv-dossier-list">
              <div>
                <span className="hv-list-number">01</span>
                <div>
                  <strong>Organised by room and system</strong>
                  <p>Boiler, roof, kitchen, electrics and everything between.</p>
                </div>
              </div>
              <div>
                <span className="hv-list-number">02</span>
                <div>
                  <strong>Verified work separated clearly</strong>
                  <p>Certificates and professional documentation aren't mixed with your own notes.</p>
                </div>
              </div>
              <div>
                <span className="hv-list-number">03</span>
                <div>
                  <strong>One PDF when you need it</strong>
                  <p>Produce a clean record for your surveyor, buyer or insurer.</p>
                </div>
              </div>
            </div>

            <button className="hv-button" onClick={onGetStarted}>
              Build your property record
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="hv-paper-wrap">
            <div className="hv-paper">
              <div className="hv-paper-header">
                <div>
                  <span className="hv-paper-eyebrow">PROPERTY DOSSIER</span>
                  <h3>14 Oakfield Road</h3>
                  <p>Property history & supporting evidence</p>
                </div>
                <div className="hv-paper-house">
                  <Home size={18} />
                </div>
              </div>

              <div className="hv-paper-line" />

              <div className="hv-paper-meta">
                <span>RECORDS</span>
                <strong>47</strong>
                <span>DOCUMENTS</span>
                <strong>23</strong>
                <span>UPDATED</span>
                <strong>26 AUG 2026</strong>
              </div>

              <div className="hv-paper-section">
                <span className="hv-paper-section-title">01 / HEATING</span>
                <div className="hv-paper-entry">
                  <div>
                    <strong>Boiler replacement</strong>
                    <span>Vaillant ecoTEC plus · Utility room</span>
                  </div>
                  <div>
                    <strong>£2,850</strong>
                    <span>Verified · 12 Feb 2024</span>
                  </div>
                </div>
                <div className="hv-paper-entry">
                  <div>
                    <strong>Annual boiler service</strong>
                    <span>Gas Safe engineer</span>
                  </div>
                  <div>
                    <strong>£95</strong>
                    <span>Verified · 14 Aug 2026</span>
                  </div>
                </div>
              </div>

              <div className="hv-paper-section">
                <span className="hv-paper-section-title">02 / BATHROOM</span>
                <div className="hv-paper-entry">
                  <div>
                    <strong>Full refurbishment</strong>
                    <span>En-suite · Improvement</span>
                  </div>
                  <div>
                    <strong>£4,850</strong>
                    <span>Recorded · 02 Jun 2026</span>
                  </div>
                </div>
              </div>

              <div className="hv-paper-footer">
                <FileCheck2 size={13} />
                <span>Verified records are identified separately from self-reported entries.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hv-value-section">
        <div className="hv-container hv-value-grid">
          <div className="hv-value-visual">
            <div className="hv-value-card">
              <div className="hv-value-card-header">
                <div>
                  <span className="hv-dashboard-label">VALUE PROJECTOR</span>
                  <h3>Kitchen refurbishment</h3>
                </div>
                <TrendingUp size={19} />
              </div>

              <div className="hv-value-main">
                <span>Recorded spend</span>
                <strong>£12,400</strong>
              </div>

              <div className="hv-value-bar">
                <span style={{ width: "72%" }} />
              </div>

              <div className="hv-value-range">
                <div>
                  <span>Indicative contribution</span>
                  <strong>£18,000–£24,000</strong>
                </div>
                <span className="hv-value-tag">ROI +45–94%</span>
              </div>

              <p>
                Indicative only. Based on comparable UK market evidence and
                recorded property improvements.
              </p>
            </div>

            <div className="hv-data-note">
              <MapPin size={14} />
              <span>UK market data + HM Land Registry price-paid figures</span>
            </div>
          </div>

          <div className="hv-value-copy">
            <p className="hv-eyebrow">IMPROVEMENTS HAVE A HISTORY</p>
            <h2>
              Know what you spent.
              <br />
              Understand the <em>potential return.</em>
            </h2>
            <p>
              A new kitchen is more than a receipt in a drawer. HomeVault
              connects your recorded improvements with UK market evidence to
              give you an indicative view of what they may have contributed.
            </p>
            <p className="hv-small-note">
              It is not a valuation and it does not replace a surveyor. It is a
              better starting point for understanding your property's story.
            </p>
          </div>
        </div>
      </section>

      <section className="hv-section hv-compliance-section">
        <div className="hv-container hv-compliance-grid">
          <div>
            <p className="hv-eyebrow">THE COMPLIANCE VAULT</p>
            <h2>
              The documents you
              <br />
              will eventually <em>need.</em>
            </h2>
          </div>

          <div className="hv-compliance-copy">
            <p>
              Certificates and warranties are only useful if you can find them.
              HomeVault keeps them attached to the relevant part of the
              property and reminds you before important documents expire.
            </p>

            <div className="hv-document-grid">
              <div className="hv-document">
                <ShieldCheck size={17} />
                <div>
                  <strong>Gas Safe</strong>
                  <span>Valid until 14 Aug 2027</span>
                </div>
                <Check size={15} />
              </div>
              <div className="hv-document">
                <FileCheck2 size={17} />
                <div>
                  <strong>EICR</strong>
                  <span>Valid until 22 May 2031</span>
                </div>
                <Check size={15} />
              </div>
              <div className="hv-document">
                <FileCheck2 size={17} />
                <div>
                  <strong>FENSA</strong>
                  <span>Certificate stored</span>
                </div>
                <Check size={15} />
              </div>
              <div className="hv-document hv-document-alert">
                <Clock3 size={17} />
                <div>
                  <strong>Boiler warranty</strong>
                  <span>Expires in 42 days</span>
                </div>
                <ChevronRight size={15} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hv-install-section">
        <div className="hv-container hv-install-inner">
          <div className="hv-install-copy">
            <p className="hv-eyebrow">WHEREVER YOU KEEP YOUR HOME</p>
            <h2>
              Your property record,
              <br />
              always <em>within reach.</em>
            </h2>
            <p>
              Install HomeVault on your phone or desktop. Add a job while
              you're standing in the kitchen, then pull up the full record
              when you're sitting down with your accountant.
            </p>
          </div>

          <div className="hv-device-row">
            <div className="hv-device hv-phone">
              <div className="hv-device-notch" />
              <div className="hv-device-screen">
                <div className="hv-device-logo">
                  <span>
                    <Home size={11} />
                  </span>
                  HomeVault
                </div>
                <span className="hv-device-eyebrow">TODAY</span>
                <strong>Log a new job</strong>
                <div className="hv-device-field">
                  <Wrench size={12} />
                  Boiler service
                </div>
                <div className="hv-device-field">
                  <MapPin size={12} />
                  Utility room
                </div>
                <div className="hv-device-photo">
                  <ImageIcon size={17} />
                  Add photos
                </div>
              </div>
            </div>

            <div className="hv-device hv-desktop">
              <div className="hv-device-topbar">
                <span />
                <span />
                <span />
              </div>
              <div className="hv-desktop-screen">
                <div className="hv-desktop-nav">
                  <span className="hv-desktop-brand">HomeVault</span>
                  <span>Overview</span>
                  <span>Maintenance</span>
                  <span>Documents</span>
                </div>
                <div className="hv-desktop-content">
                  <span className="hv-device-eyebrow">PROPERTY RECORD</span>
                  <h4>14 Oakfield Road</h4>
                  <div className="hv-desktop-lines">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="hv-desktop-row">
                    <div />
                    <div />
                    <div />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hv-pricing-section" id="pricing">
        <div className="hv-container">
          <div className="hv-section-intro hv-pricing-intro">
            <p className="hv-eyebrow">SIMPLE PRICING</p>
            <h2>
              One property or several.
              <br />
              Keep the record <em>complete.</em>
            </h2>
            <p>
              Start free. Upgrade when your property portfolio or your need
              for evidence grows.
            </p>
          </div>

          <div className="hv-pricing-grid">
            {pricing.map((plan) => (
              <article
                className={`hv-price-card ${plan.featured ? "hv-price-featured" : ""}`}
                key={plan.name}
              >
                {plan.featured && <span className="hv-popular">MOST POPULAR</span>}

                <div className="hv-price-header">
                  <span className="hv-price-name">{plan.name}</span>
                  <p>{plan.description}</p>
                </div>

                <div className="hv-price">
                  <strong>{plan.price}</strong>
                  <span>{plan.period}</span>
                </div>

                <div className="hv-price-divider" />

                <ul>
                  {plan.features.map((item) => (
                    <li key={item}>
                      <Check size={15} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={
                    plan.featured
                      ? "hv-button hv-price-button"
                      : "hv-outline-button hv-price-button"
                  }
                  onClick={onGetStarted}
                >
                  {plan.name === "Free" ? "Get started free" : `Choose ${plan.name}`}
                  <ArrowRight size={15} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hv-final-cta">
        <div className="hv-container hv-final-inner">
          <p className="hv-eyebrow">START WITH WHAT YOU HAVE</p>
          <h2>
            The work is already done.
            <br />
            Now keep the <em>evidence.</em>
          </h2>
          <p>
            Add your property's history today. You can fill in the gaps as you
            find old receipts, certificates and photographs.
          </p>
          <button className="hv-button hv-button-light" onClick={onGetStarted}>
            Create your free property record
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      <footer className="hv-footer">
        <div className="hv-container hv-footer-inner">
          <div className="hv-footer-brand">
            <div className="hv-brand">
              <span className="hv-brand-mark">
                <Home size={17} strokeWidth={1.8} />
              </span>
              <span>HomeVault</span>
            </div>
            <p>Your property. Your records. Your proof.</p>
          </div>

          <div className="hv-footer-links">
            <a href="#features">Features</a>
            <a href="#dossier">Dossier</a>
            <a href="#pricing">Pricing</a>
            <button onClick={onSignIn}>Sign in</button>
          </div>

          <div className="hv-footer-meta">
            <span>Built for UK homeowners and landlords</span>
            <span>© 2026 HomeVault</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
