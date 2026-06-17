import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  ArrowRight,
  Users,
  FileText,
  ClipboardCheck,
  ShoppingCart,
  Receipt,
  BarChart3,
  Shield,
  Zap,
  CheckCircle2,
  Sparkles,
  Github,
  Twitter,
  Linkedin,
  Star,
  TrendingUp,
  Globe,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  useGSAP(
    () => {
      // Hero entrance timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { y: 24, opacity: 0, duration: 0.7 })
        .from(".hero-title-word", { y: 80, opacity: 0, duration: 0.9, stagger: 0.08 }, "-=0.4")
        .from(".hero-sub", { y: 20, opacity: 0, duration: 0.7 }, "-=0.4")
        .from(".hero-cta", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.3")
        .from(".hero-stat", { y: 20, opacity: 0, duration: 0.5, stagger: 0.08 }, "-=0.4")
        .from(".hero-card", { y: 60, opacity: 0, scale: 0.92, duration: 1, stagger: 0.12 }, "-=0.6");

      // Floating orbs
      gsap.to(".orb-1", { x: 60, y: -40, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".orb-2", { x: -50, y: 50, duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".orb-3", { x: 40, y: -30, duration: 12, repeat: -1, yoyo: true, ease: "sine.inOut" });

      // Marquee
      gsap.to(".marquee-track", {
        xPercent: -50,
        duration: 30,
        ease: "none",
        repeat: -1,
      });

      // Scroll-pinned counter
      ScrollTrigger.batch(".reveal", {
        onEnter: (els) =>
          gsap.from(els, {
            y: 50,
            opacity: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: "power3.out",
          }),
        once: true,
        start: "top 85%",
      });

      // Feature card hover tilt setup
      gsap.utils.toArray<HTMLElement>(".feature-card").forEach((card) => {
        const onMove = (e: MouseEvent) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(card, { rotateY: x * 8, rotateX: -y * 8, duration: 0.5, ease: "power2.out", transformPerspective: 1000 });
        };
        const onLeave = () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6 });
        card.addEventListener("mousemove", onMove);
        card.addEventListener("mouseleave", onLeave);
      });
    },
    { scope: heroRef }
  );

  return (
    <div ref={heroRef} className="min-h-screen bg-background overflow-x-hidden">
      <Nav />
      <Hero heroY={heroY} heroOpacity={heroOpacity} orbRef={orbRef} />
      <Marquee />
      <Features />
      <Workflow />
      <Stats />
      <Testimonial />
      <CtaSection />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-border/50"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-odoo-700 to-odoo-500 grid place-items-center text-white font-bold shadow-glow">
              VB
            </div>
            <div className="absolute -inset-1 rounded-xl bg-primary/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-bold text-lg tracking-tight">VendorBridge</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#workflow" className="text-muted-foreground hover:text-foreground transition-colors">Workflow</a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="#stats" className="text-muted-foreground hover:text-foreground transition-colors">Customers</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to="/signup">
            <Button variant="gradient" size="sm" className="group">
              Get started
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

function Hero({
  heroY,
  heroOpacity,
  orbRef,
}: {
  heroY: MotionValue<number>;
  heroOpacity: MotionValue<number>;
  orbRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <section className="relative gradient-bg overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div ref={orbRef} className="absolute inset-0 pointer-events-none">
        <div className="orb-1 absolute top-20 -left-20 h-72 w-72 rounded-full bg-odoo-300/40 blur-3xl" />
        <div className="orb-2 absolute top-40 right-0 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl" />
        <div className="orb-3 absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-pink-200/30 blur-3xl" />
      </div>

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container relative pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="hero-eyebrow inline-flex items-center gap-2 rounded-full border border-odoo-200 bg-white/70 backdrop-blur px-4 py-1.5 text-xs font-medium text-odoo-700 mb-7">
            <Sparkles size={12} className="text-odoo-500" />
            <span>Procurement, redesigned for modern teams</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tighter leading-[0.95]">
            <span className="hero-title-word inline-block mr-3">Vendor</span>
            <span className="hero-title-word inline-block gradient-text mr-3">workflows</span>
            <br />
            <span className="hero-title-word inline-block mr-3">on</span>
            <span className="hero-title-word inline-block">autopilot.</span>
          </h1>
          <p className="hero-sub mt-7 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            RFQs, quotations, approvals, POs and invoices — unified in one
            elegant ERP. Built for procurement teams that ship.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/signup" className="hero-cta">
              <Button variant="gradient" size="xl" className="group">
                Start free trial
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login" className="hero-cta">
              <Button variant="outline" size="xl">Sign in</Button>
            </Link>
          </div>
          <div className="hero-cta mt-6 flex items-center gap-2 justify-center text-xs text-muted-foreground">
            <CheckCircle2 size={14} className="text-odoo-600" />
            No credit card required
            <span className="mx-2 h-1 w-1 rounded-full bg-muted-foreground/40" />
            <CheckCircle2 size={14} className="text-odoo-600" />
            14-day free trial
          </div>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { v: "10k+", l: "Vendors managed" },
            { v: "120k", l: "RFQs processed" },
            { v: "99.9%", l: "Uptime SLA" },
          ].map((s) => (
            <div key={s.l} className="hero-stat text-center">
              <div className="text-2xl md:text-3xl font-bold gradient-text">{s.v}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Hero product cards mock */}
        <div className="mt-20 relative max-w-5xl mx-auto">
          <div className="hero-card relative rounded-2xl glass shadow-glow-lg p-2 backdrop-blur-2xl">
            <DashboardMock />
          </div>
          <FloatingCard
            className="hero-card absolute -left-6 md:-left-16 top-16 md:top-24 hidden sm:block"
            icon={<ClipboardCheck className="text-odoo-600" size={18} />}
            title="3 approvals"
            sub="Awaiting your review"
          />
          <FloatingCard
            className="hero-card absolute -right-6 md:-right-16 bottom-10 hidden sm:block"
            icon={<Receipt className="text-emerald-600" size={18} />}
            title="$184k"
            sub="Invoices this month"
          />
        </div>
      </motion.div>
    </section>
  );
}

function FloatingCard({
  icon,
  title,
  sub,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  className?: string;
}) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className={`rounded-xl bg-white shadow-soft border border-border/50 p-3 flex items-center gap-3 backdrop-blur-md ${className}`}
    >
      <div className="h-9 w-9 rounded-lg bg-secondary grid place-items-center">{icon}</div>
      <div>
        <div className="text-sm font-semibold leading-tight">{title}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </motion.div>
  );
}

function DashboardMock() {
  return (
    <div className="rounded-xl bg-white border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        </div>
        <div className="ml-3 text-xs text-muted-foreground">app.vendorbridge.io/dashboard</div>
      </div>
      <div className="grid grid-cols-12 gap-0">
        <aside className="hidden md:flex col-span-3 lg:col-span-2 bg-odoo-700 text-white/90 p-4 flex-col gap-1 min-h-[420px]">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-7 w-7 rounded-md bg-white/20 grid place-items-center text-xs font-bold">VB</div>
            <span className="text-sm font-semibold">VendorBridge</span>
          </div>
          {["Dashboard", "Vendors", "RFQs", "Quotations", "Approvals", "POs", "Invoices"].map((l, i) => (
            <div
              key={l}
              className={`text-xs px-3 py-1.5 rounded-md ${
                i === 0 ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10"
              }`}
            >
              {l}
            </div>
          ))}
        </aside>
        <main className="col-span-12 md:col-span-9 lg:col-span-10 p-5 space-y-4 bg-background">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { l: "Active RFQs", v: "42", t: "+12%" },
              { l: "Pending Approvals", v: "8", t: "-3%" },
              { l: "Monthly Spend", v: "$1.2M", t: "+8%" },
              { l: "Vendors", v: "184", t: "+5%" },
            ].map((c) => (
              <div key={c.l} className="rounded-lg border bg-card p-3">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{c.l}</div>
                <div className="text-lg font-bold mt-1">{c.v}</div>
                <div className="text-[10px] text-emerald-600 font-medium">{c.t}</div>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="md:col-span-2 rounded-lg border bg-card p-4 h-44 flex flex-col">
              <div className="text-xs font-semibold mb-3">Spend Trend</div>
              <div className="flex-1 flex items-end gap-1.5">
                {[40, 55, 35, 70, 60, 85, 75, 95, 80, 90, 100, 88].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-odoo-600 to-odoo-400"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4 space-y-2.5 h-44">
              <div className="text-xs font-semibold">Recent activity</div>
              {[
                { l: "RFQ #284 closed", c: "bg-emerald-100 text-emerald-700" },
                { l: "Quote accepted", c: "bg-blue-100 text-blue-700" },
                { l: "PO #119 issued", c: "bg-odoo-100 text-odoo-700" },
              ].map((a) => (
                <div key={a.l} className="flex items-center justify-between text-[11px]">
                  <span>{a.l}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${a.c}`}>new</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Marquee() {
  const logos = ["ACME Corp", "Globex", "Initech", "Umbrella", "Stark Industries", "Hooli", "Wayne Enterprises", "Tyrell"];
  return (
    <section className="border-y bg-muted/20 py-10 overflow-hidden">
      <div className="container">
        <p className="text-center text-xs text-muted-foreground uppercase tracking-widest mb-6">
          Trusted by procurement teams worldwide
        </p>
        <div className="relative">
          <div className="marquee-track flex gap-14 whitespace-nowrap will-change-transform">
            {[...logos, ...logos].map((l, i) => (
              <div key={i} className="text-2xl font-bold text-muted-foreground/40 tracking-tight">
                {l}
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Users, title: "Vendor registry", desc: "Centralized vendor profiles, GST, categories and status workflows.", color: "from-purple-500 to-pink-500" },
  { icon: FileText, title: "RFQ engine", desc: "Multi-line item RFQs, vendor invitations, deadline tracking.", color: "from-blue-500 to-cyan-500" },
  { icon: ClipboardCheck, title: "Quote comparison", desc: "Side-by-side bid analysis with discount + GST modeling.", color: "from-emerald-500 to-teal-500" },
  { icon: Shield, title: "Approvals & RBAC", desc: "Manager approvals with full audit trail and role gates.", color: "from-orange-500 to-red-500" },
  { icon: ShoppingCart, title: "Purchase orders", desc: "Auto-generated POs from accepted quotes with PDF rendering.", color: "from-violet-500 to-purple-500" },
  { icon: Receipt, title: "Smart invoicing", desc: "Generate, email and track invoices linked to fulfilled POs.", color: "from-rose-500 to-fuchsia-500" },
  { icon: BarChart3, title: "Spend reports", desc: "Monthly, vendor-level, and trend analytics in real-time.", color: "from-amber-500 to-orange-500" },
  { icon: Zap, title: "Activity timeline", desc: "Every action logged. Full forensic-grade audit history.", color: "from-cyan-500 to-blue-500" },
  { icon: Lock, title: "Enterprise security", desc: "JWT auth, refresh rotation, RBAC, encrypted at rest.", color: "from-slate-500 to-zinc-500" },
];

function Features() {
  return (
    <section id="features" className="container py-24 md:py-32">
      <div className="text-center max-w-2xl mx-auto mb-16 reveal">
        <div className="inline-flex items-center gap-2 rounded-full border bg-secondary/50 px-3 py-1 text-xs font-medium text-odoo-700 mb-4">
          <Sparkles size={12} />
          Built for scale
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          Every procurement workflow,
          <br /> <span className="gradient-text">one elegant platform.</span>
        </h2>
        <p className="mt-4 text-muted-foreground text-lg">
          Replace your tangle of spreadsheets and email chains with a unified system.
        </p>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            variants={fadeUp}
            custom={i}
            className="feature-card group relative rounded-2xl border bg-card p-6 hover:shadow-glow transition-shadow"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-[0.04] transition-opacity`} />
            <div className={`relative h-11 w-11 rounded-xl bg-gradient-to-br ${f.color} grid place-items-center text-white mb-4 shadow-md`}>
              <f.icon size={20} />
            </div>
            <h3 className="font-semibold text-lg mb-1.5">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            <div className="mt-4 flex items-center text-xs font-medium text-odoo-700 opacity-0 group-hover:opacity-100 transition-opacity">
              Learn more <ArrowRight size={12} className="ml-1" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

const steps = [
  { n: "01", title: "Create RFQ", desc: "Define line items, deadlines and invite vendors in seconds." },
  { n: "02", title: "Receive quotes", desc: "Vendors submit competitive bids through a streamlined portal." },
  { n: "03", title: "Compare & approve", desc: "Side-by-side analysis with manager approval gates and audit trail." },
  { n: "04", title: "Issue PO & invoice", desc: "Auto-generated documents with PDF export and email delivery." },
];

function Workflow() {
  return (
    <section id="workflow" className="relative bg-gradient-to-b from-secondary/30 to-background py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="container relative">
        <div className="text-center max-w-2xl mx-auto mb-16 reveal">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            From request to <span className="gradient-text">receipt.</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">A complete procure-to-pay loop. End-to-end traceability.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="relative rounded-2xl border bg-card/80 backdrop-blur p-6 hover:shadow-glow transition-shadow"
            >
              <div className="text-6xl font-extrabold gradient-text/20 tracking-tighter opacity-25 mb-3">{s.n}</div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 text-muted-foreground/30" size={18} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { v: "10,000+", l: "Vendors managed", icon: Users },
    { v: "$2.4B", l: "Procurement processed", icon: TrendingUp },
    { v: "98%", l: "Customer satisfaction", icon: Star },
    { v: "40+", l: "Countries served", icon: Globe },
  ];
  return (
    <section id="stats" className="container py-24 md:py-32">
      <div className="rounded-3xl bg-odoo-700 text-white p-10 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 noise opacity-[0.05]" />
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />
        <div className="relative text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Numbers that matter.</h2>
          <p className="mt-3 text-white/70 text-lg">Trusted by teams shipping at every scale.</p>
        </div>
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <s.icon size={20} className="mx-auto text-white/60 mb-3" />
              <div className="text-4xl md:text-5xl font-bold tracking-tight">{s.v}</div>
              <div className="text-sm text-white/60 mt-1">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section className="container py-20 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl mx-auto text-center"
      >
        <div className="flex justify-center gap-1 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={20} className="text-yellow-500 fill-yellow-500" />
          ))}
        </div>
        <blockquote className="text-2xl md:text-3xl font-medium tracking-tight leading-snug">
          "We replaced six different tools with VendorBridge and cut our procurement cycle
          time by <span className="gradient-text">62%</span>. The approval workflow alone is worth the price."
        </blockquote>
        <div className="mt-7 flex items-center justify-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-odoo-500 to-odoo-700 grid place-items-center text-white font-semibold">
            SK
          </div>
          <div className="text-left">
            <div className="font-semibold">Sarah Kim</div>
            <div className="text-xs text-muted-foreground">VP Procurement, Globex Industries</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function CtaSection() {
  return (
    <section id="pricing" className="container py-20 md:py-28">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="rounded-3xl border bg-gradient-to-br from-secondary via-background to-odoo-50 p-10 md:p-16 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">
            Ready to <span className="gradient-text">streamline</span> procurement?
          </h2>
          <p className="mt-5 text-muted-foreground text-lg max-w-xl mx-auto">
            Sign up free, no credit card required. Get full access for 14 days.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup">
              <Button variant="gradient" size="xl" className="group">
                Get started free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="xl">I have an account</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-background py-12">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-odoo-700 to-odoo-500 grid place-items-center text-white font-bold text-sm">
                VB
              </div>
              <span className="font-bold">VendorBridge</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Modern procurement ERP for teams that ship.
            </p>
            <div className="flex gap-3 mt-4">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="h-8 w-8 rounded-md border grid place-items-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#workflow" className="hover:text-foreground">Workflow</a></li>
              <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">About</a></li>
              <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} VendorBridge. All rights reserved.</p>
          <p>Built with care for procurement teams.</p>
        </div>
      </div>
    </footer>
  );
}
