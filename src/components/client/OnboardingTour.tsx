import { useState, useEffect, useCallback } from "react";
import Joyride, { CallBackProps, EVENTS, STATUS, Step, TooltipRenderProps, LIFECYCLE } from "react-joyride";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_STEPS = 9;

// Steps that require navigation BEFORE they render
const NAVIGATION_MAP: Record<number, string> = {
    2: "/dashboard/domains",
    4: "/dashboard/dns",
    7: "/dashboard/settings",
};

// Steps that trigger navigation on "next" (current index -> next needs nav)
const NEXT_TRIGGERS_NAV = new Set([1, 3, 6]);

/**
 * Waits for a DOM element matching `selector` to appear and be visible.
 * Uses MutationObserver instead of a fixed timeout to handle async-loaded
 * components (e.g. Convex query loading guards in ClientDNS/ClientSettings).
 */
function waitForElement(selector: string, timeout = 5000): Promise<boolean> {
    return new Promise((resolve) => {
        // Already in DOM
        const existing = document.querySelector(selector);
        if (existing && existing.getBoundingClientRect().height > 0) {
            resolve(true);
            return;
        }

        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el && el.getBoundingClientRect().height > 0) {
                observer.disconnect();
                resolve(true);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Safety: don't wait forever
        setTimeout(() => {
            observer.disconnect();
            resolve(false);
        }, timeout);
    });
}

function StepDots({ current, total }: { current: number; total: number }) {
    return (
        <div className="flex items-center justify-center gap-1 pb-1 sm:gap-1.5">
            {Array.from({ length: total }, (_, i) => (
                <motion.div
                    key={i}
                    className={
                        i < current
                            ? "h-1 w-1 rounded-full bg-primary sm:h-1.5 sm:w-1.5"
                            : i === current
                              ? "h-1.5 w-1.5 rounded-full border-2 border-primary bg-primary/20 sm:h-2 sm:w-2"
                              : "h-1 w-1 rounded-full bg-muted-foreground/25 sm:h-1.5 sm:w-1.5"
                    }
                    initial={false}
                    animate={
                        i === current
                            ? { scale: [1, 1.3, 1] }
                            : { scale: 1 }
                    }
                    transition={{ duration: 0.3 }}
                />
            ))}
        </div>
    );
}

export function OnboardingTour() {
    const user = useQuery(api.users.currentUser);
    const completeOnboarding = useMutation(api.users.completeOnboarding);
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        if (user && !user.hasCompletedOnboarding) {
            setRun(true);
        }
    }, [user]);

    const fireRealisticConfetti = () => {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 }
        };

        const fire = (particleRatio: number, opts: confetti.Options) => {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        };

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });
        fire(0.2, {
            spread: 60,
        });
        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    };

    const handleSkip = async () => {
        setRun(false);
        if (user && !user.hasCompletedOnboarding) {
            await completeOnboarding();
        }
    };

    const steps: Step[] = [
        // 0: Welcome (centered overlay)
        {
            target: "body",
            placement: "center",
            content: "welcome",
            disableBeacon: true,
        },
        // 1: Domains Tab
        {
            target: '[data-tour="domains-tab"]',
            content: "This is where all your domains live. Let's take a closer look.",
            placement: "bottom",
            title: "Domains",
        },
        // 2: Claim Button (navigates to /dashboard/domains first)
        {
            target: '[data-tour="add-domain-button"]',
            content: "Claim a free subdomain in seconds. Just pick a name and verify a quick captcha.",
            placement: "bottom",
            title: "Claim a Subdomain",
        },
        // 3: DNS Tab
        {
            target: '[data-tour="dns-tab"]',
            content: "Once you have a domain, you'll configure DNS records here.",
            placement: "bottom",
            title: "DNS Records",
        },
        // 4: Add DNS Record (navigates to /dashboard/dns first)
        {
            target: '[data-tour="add-dns-btn"]',
            content: "Add A, CNAME, TXT, or MX records. Changes propagate globally within seconds.",
            placement: "bottom",
            title: "Add a Record",
        },
        // 5: DNS Guide
        {
            target: '[data-tour="dns-guide-btn"]',
            content: "Not sure what values to use? Our guide covers Vercel, GitHub Pages, Netlify, and more.",
            placement: "bottom",
            title: "Setup Guide",
        },
        // 6: Settings Tab
        {
            target: '[data-tour="settings-tab"]',
            content: "Last stop \u2014 your account settings.",
            placement: "bottom",
            title: "Settings",
        },
        // 7: Name Input (navigates to /dashboard/settings first)
        {
            target: '[data-tour="settings-name-input"]',
            content: "Personalize your profile with a display name.",
            placement: "bottom",
            title: "Display Name",
        },
        // 8: Save Button
        {
            target: '[data-tour="settings-save-btn"]',
            content: "Remember to save after making changes!",
            placement: "bottom",
            title: "Save Changes",
        },
    ];

    const navigateAndAdvance = useCallback(async (nextIndex: number) => {
        const route = NAVIGATION_MAP[nextIndex];
        if (!route) return;

        navigate(route);

        // Wait for the target element to actually appear in the DOM
        // instead of guessing with a fixed timeout
        const targetSelector = steps[nextIndex]?.target as string;
        if (targetSelector && targetSelector !== "body") {
            const found = await waitForElement(targetSelector);
            if (found) {
                setStepIndex(nextIndex);
            } else {
                // Element never appeared — skip to next step
                setStepIndex(nextIndex + 1);
            }
        } else {
            setStepIndex(nextIndex);
        }
    }, [navigate, steps]);

    const handleJoyrideCallback = useCallback(async (data: CallBackProps) => {
        const { status, type, index, lifecycle, action } = data;

        // Handle Tour Finished or Skipped
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as "finished" | "skipped")) {
            setRun(false);
            if (user && !user.hasCompletedOnboarding) {
                await completeOnboarding();
            }
            if (status === STATUS.FINISHED) {
                fireRealisticConfetti();
            }
            return;
        }

        // Handle TARGET_NOT_FOUND — fallback retry
        // In controlled mode, Joyride stalls silently when a target is missing.
        // This retries once after waiting for the element to appear.
        if (type === EVENTS.TARGET_NOT_FOUND) {
            const targetSelector = steps[index]?.target as string;
            if (targetSelector && targetSelector !== "body") {
                const found = await waitForElement(targetSelector);
                if (found) {
                    // Re-trigger Joyride by briefly changing stepIndex
                    // so the store detects a change and re-evaluates the target
                    setStepIndex(-1);
                    requestAnimationFrame(() => setStepIndex(index));
                } else {
                    // Element never appeared — skip past it
                    setStepIndex(index + 1);
                }
            }
            return;
        }

        // Handle NEXT
        if (type === EVENTS.STEP_AFTER && action === "next" && lifecycle === LIFECYCLE.COMPLETE) {
            const nextIndex = index + 1;

            if (NEXT_TRIGGERS_NAV.has(index) && NAVIGATION_MAP[nextIndex]) {
                await navigateAndAdvance(nextIndex);
            } else {
                setStepIndex(nextIndex);
            }
        }

        // Handle PREV
        if (type === EVENTS.STEP_AFTER && action === "prev" && lifecycle === LIFECYCLE.COMPLETE) {
            setStepIndex(index - 1);
        }
    }, [user, completeOnboarding, navigateAndAdvance, steps]);

    const CustomTooltip = ({
        index,
        step,
        backProps,
        primaryProps,
        tooltipProps,
    }: TooltipRenderProps) => {
        const isWelcome = index === 0;
        const isLast = index === TOTAL_STEPS - 1;

        // Welcome step — special layout
        if (isWelcome) {
            return (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`step-${index}`}
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        {...tooltipProps}
                    >
                        <Card className="w-[calc(100vw-2rem)] max-w-md rounded-xl border border-border bg-card p-0 shadow-lg">
                            <div className="flex flex-col items-center px-5 pt-5 pb-2 text-center sm:px-8 sm:pt-8">
                                <motion.div
                                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 sm:mb-4 sm:h-16 sm:w-16 sm:rounded-2xl"
                                    animate={{ scale: [1, 1.08, 1] }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <Rocket className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
                                </motion.div>
                                <h2 className="text-lg font-bold text-card-foreground sm:text-xl">
                                    Welcome to doofs.tech!
                                </h2>
                                <p className="mt-1.5 text-xs text-muted-foreground sm:mt-2 sm:text-sm">
                                    Let's get you set up in under a minute.
                                </p>
                            </div>
                            <div className="flex items-center justify-between px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4">
                                <button
                                    onClick={handleSkip}
                                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Skip tour
                                </button>
                                <Button size="sm" {...primaryProps}>
                                    Let's Go!
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            );
        }

        // Standard step tooltip
        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={`step-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    {...tooltipProps}
                >
                    <Card className="w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-border bg-card p-0 shadow-lg">
                        {/* Progress dots */}
                        <div className="px-4 pt-3 sm:px-5 sm:pt-4">
                            <StepDots current={index} total={TOTAL_STEPS} />
                        </div>

                        {/* Header + Content */}
                        <div className="px-4 pt-2 pb-3 sm:px-5 sm:pt-3 sm:pb-4">
                            {step.title && (
                                <h3 className="text-xs font-semibold text-card-foreground sm:text-sm">
                                    {step.title as string}
                                </h3>
                            )}
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                {step.content as string}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 sm:px-5 sm:py-3">
                            <button
                                onClick={handleSkip}
                                className="text-[11px] text-muted-foreground transition-colors hover:text-foreground sm:text-xs"
                            >
                                Skip tour
                            </button>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                {index > 0 && (
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm" {...backProps}>
                                        <ChevronLeft className="mr-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                        Back
                                    </Button>
                                )}
                                <Button size="sm" className="h-7 px-2.5 text-xs sm:h-8 sm:px-3 sm:text-sm" {...primaryProps}>
                                    {isLast ? (
                                        <>{"🎉 Finish"}</>
                                    ) : (
                                        <>
                                            Next
                                            <ChevronRight className="ml-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </AnimatePresence>
        );
    };

    if (!user || user.hasCompletedOnboarding) return null;

    return (
        <Joyride
            steps={steps}
            run={run}
            stepIndex={stepIndex}
            continuous
            showProgress
            showSkipButton
            disableOverlayClose
            scrollOffset={80}
            spotlightPadding={4}
            tooltipComponent={CustomTooltip}
            callback={handleJoyrideCallback}
            floaterProps={{
                disableAnimation: true,
                styles: {
                    floater: {
                        maxWidth: "calc(100vw - 1rem)",
                    },
                },
            }}
            styles={{
                options: {
                    arrowColor: theme === "dark" ? "hsl(var(--card))" : "hsl(var(--card))",
                    backgroundColor: "transparent",
                    overlayColor: "rgba(0, 0, 0, 0.75)",
                    primaryColor: "hsl(var(--primary))",
                    textColor: "hsl(var(--card-foreground))",
                    zIndex: 1000,
                },
                overlay: {
                    backdropFilter: "none",
                },
            }}
        />
    );
}
