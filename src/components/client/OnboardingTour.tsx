import { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step, TooltipRenderProps } from "react-joyride";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, X } from "lucide-react";

export function OnboardingTour() {
    const user = useQuery(api.users.currentUser);
    const completeOnboarding = useMutation(api.users.completeOnboarding);
    const { theme } = useTheme();
    const [run, setRun] = useState(false);

    useEffect(() => {
        if (user && user.hasCompletedOnboarding === false) {
            setRun(true);
        }
    }, [user]);

    const handleJoyrideCallback = async (data: CallBackProps) => {
        const { status } = data;
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
            setRun(false);
            if (user && !user.hasCompletedOnboarding) {
                await completeOnboarding();
            }
        }
    };

    const steps: Step[] = [
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
        {
            target: '[data-tour="domains-tab"]',
            content: "This is your command center. View all your active domains and their status here.",
            placement: "bottom",
        },
        {
            target: '[data-tour="add-domain-button"]',
            content: "Click here to claim a new subdomain instantly. It's free and fast.",
            placement: "bottom",
        },
        {
            target: '[data-tour="dns-tab"]',
            content: "Once claimed, manage your A, CNAME, and TXT records here. Changes propagate globally.",
            placement: "bottom",
        },
    ];

    const CustomTooltip = ({
        continuous,
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
            continuous
            showProgress
            showSkipButton
            disableOverlayClose
            tooltipComponent={CustomTooltip}
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    arrowColor: theme === 'dark' ? '#1e293b' : '#ffffff', // Match card bg
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    overlayColor: 'rgba(0, 0, 0, 0.85)', // Darker overlay for focus
                    primaryColor: '#000',
                    textColor: theme === 'dark' ? '#fff' : '#000',
                    zIndex: 1000,
                },
                overlay: {
                    backdropFilter: "blur(4px)", // Glassmorphism effect
                },
            }}
        />
    );
}
