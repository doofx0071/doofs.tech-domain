import { useState, useEffect } from "react";
import Joyride, { CallBackProps, EVENTS, STATUS, Step, TooltipRenderProps, LIFECYCLE } from "react-joyride";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

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

    const handleJoyrideCallback = async (data: CallBackProps) => {
        const { status, type, index, lifecycle, action } = data;

        // Handle Tour Finished
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
            setRun(false);
            if (user && !user.hasCompletedOnboarding) {
                await completeOnboarding();
            }
            // Only fire confetti if actually finished (not skipped)
            if (status === STATUS.FINISHED) {
                fireRealisticConfetti();
            }
            return;
        }

        // Handle Navigation Logic on Step Change
        if (type === EVENTS.STEP_AFTER && action === 'next' && lifecycle === LIFECYCLE.COMPLETE) {
            // Index 1 (Domains Tab) -> Index 2 (ClientDomains Page)
            if (index === 1) {
                navigate('/dashboard/domains');
                // Small delay to allow page mount, though Joyride retries targets
                setTimeout(() => setStepIndex(index + 1), 100);
            }
            // Index 3 (Delete Domain) -> Index 4 (DNS Tab)
            else if (index === 3) {
                // No navigation needed yet, just move to DNS tab highlighting
                setStepIndex(index + 1);
            }
            // Index 4 (DNS Tab) -> Index 5 (ClientDNS Page)
            else if (index === 4) {
                navigate('/dashboard/dns');
                setTimeout(() => setStepIndex(index + 1), 100);
            }
            // Index 6 (DNS Guide) -> Index 7 (Settings Tab)
            else if (index === 6) {
                // Move to Settings Tab highlight
                setStepIndex(index + 1);
            }
            // Index 7 (Settings Tab) -> Index 8 (ClientSettings Page)
            else if (index === 7) {
                navigate('/dashboard/settings');
                setTimeout(() => setStepIndex(index + 1), 100);
            }
            else {
                // Default next step
                setStepIndex(index + 1);
            }
        }

        // Handle Prev Button logic for navigation
        if (type === EVENTS.STEP_AFTER && action === 'prev' && lifecycle === LIFECYCLE.COMPLETE) {
            setStepIndex(index - 1);
        }
    };

    const steps: Step[] = [
        // 0. Welcome
        {
            target: "body",
            placement: "center",
            content: (
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <Rocket className="h-12 w-12 text-primary animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold">Welcome to doofs.tech!</h2>
                    <p className="text-muted-foreground">
                        Ready to claim your free developer domain? Let's get you set up in less than 30 seconds.
                    </p>
                </div>
            ),
            disableBeacon: true,
        },
        // 1. Domains Tab
        {
            target: '[data-tour="domains-tab"]',
            content: "Let's start by managing your domains. Click next to view your dashboard.",
            placement: "bottom",
        },
        // 2. Claim Button (Inside /domains)
        {
            target: '[data-tour="add-domain-button"]',
            content: "Click here to claim a new subdomain instantly. You'll need to verify a quick Turnstile captcha.",
            placement: "bottom",
        },
        // 3. Delete Domain (Inside /domains)
        {
            target: '[data-tour="delete-domain-btn"]',
            content: "Need to free up a slot? You can delete unused domains here.",
            placement: "bottom",
        },
        // 4. DNS Tab
        {
            target: '[data-tour="dns-tab"]',
            content: "Now, let's configure your DNS records. Click next to proceed.",
            placement: "bottom",
        },
        // 5. Add Record (Inside /dns)
        {
            target: '[data-tour="add-dns-btn"]',
            content: "Add A, CNAME, TXT, or MX records here. Changes propagate globally within seconds.",
            placement: "bottom",
        },
        // 6. DNS Guide (Inside /dns)
        {
            target: '[data-tour="dns-guide-btn"]',
            content: "Unsure about configuration values? Check our built-in guide for Vercel, GitHub Pages, and more.",
            placement: "bottom",
        },
        // 7. Settings Tab
        {
            target: '[data-tour="settings-tab"]',
            content: "Finally, let's look at your account settings.",
            placement: "bottom",
        },
        // 8. Name Input (Inside /settings)
        {
            target: '[data-tour="settings-name-input"]',
            content: "Update your display name here to personalize your profile.",
            placement: "bottom",
        },
        // 9. Save Button (Inside /settings)
        {
            target: '[data-tour="settings-save-btn"]',
            content: "Don't forget to save your changes!",
            placement: "bottom",
        },
        // 10. Delete Account (Inside /settings)
        {
            target: '[data-tour="delete-account-btn"]',
            content: "The Danger Zone. Permanently delete your account here if you wish to leave the platform.",
            placement: "top",
        },
    ];

    const CustomTooltip = ({
        index,
        step,
        backProps,
        closeProps,
        primaryProps,
        tooltipProps,
    }: TooltipRenderProps) => {
        return (
            <Card
                {...tooltipProps}
                className="max-w-md p-0 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] border-2 border-primary"
            >
                <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center sm:hidden">
                    <span className="font-bold">Step {index + 1}</span>
                    <Button variant="ghost" size="icon" {...closeProps} className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="p-6">
                    {step.content}
                </div>
                <div className="p-4 bg-muted/50 border-t flex justify-between items-center">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                        Step {index + 1} of {steps.length}
                    </span>
                    <div className="flex gap-2 ml-auto">
                        {index > 0 && (
                            <Button variant="outline" size="sm" {...backProps}>
                                Back
                            </Button>
                        )}
                        <Button size="sm" {...primaryProps}>
                            {index === steps.length - 1 ? "Finish" : "Next"}
                        </Button>
                    </div>
                </div>
            </Card>
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
            tooltipComponent={CustomTooltip}
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    arrowColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    overlayColor: 'rgba(0, 0, 0, 0.85)',
                    primaryColor: '#000',
                    textColor: theme === 'dark' ? '#fff' : '#000',
                    zIndex: 1000,
                },
                overlay: {
                    // Explicitly remove blur to fix user issue
                    backdropFilter: 'none',
                },
            }}
        />
    );
}
