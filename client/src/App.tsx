import React from "react";
import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";
import ProjectDetail from "@/pages/ProjectDetail";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LocaleProvider } from "./contexts/LocaleContext";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";

function ScrollRestoration() {
  const [location] = useLocation();
  const previousLocation = useRef(location);
  const positions = useRef(new Map<string, number>());
  const isPopNavigation = useRef(false);

  useEffect(() => {
    const handlePopState = () => { isPopNavigation.current = true; };
    const handleScroll = () => { positions.current.set(previousLocation.current, window.scrollY); };
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.history.scrollRestoration = previousRestoration;
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (previousLocation.current === location) return;
    positions.current.set(previousLocation.current, window.scrollY);
    const nextScrollTop = isPopNavigation.current ? positions.current.get(location) ?? 0 : 0;
    window.scrollTo({ top: nextScrollTop, left: 0, behavior: "auto" });
    previousLocation.current = location;
    isPopNavigation.current = false;
  }, [location]);

  return null;
}

export function AppRouter() {
  return <><ScrollRestoration /><Switch>
    <Route path="/" component={Home} />
    <Route path="/portfolio" component={Portfolio} />
    <Route path="/portfolio/:id" component={ProjectDetail} />
    <Route path="/about" component={About} />
    <Route path="/services" component={Services} />
    <Route path="/contact" component={Contact} />
    <Route path="/Emadalddine" component={Admin} />
    <Route path="/admin" component={Admin} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch></>;
}

function App() {
  return <ErrorBoundary><LocaleProvider><ThemeProvider defaultTheme="light" switchable><TooltipProvider><Toaster /><AppRouter /></TooltipProvider></ThemeProvider></LocaleProvider></ErrorBoundary>;
}
export default App;
