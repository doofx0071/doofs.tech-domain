import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is it really free?",
    answer:
      "Yes. Domains by doofs.tech is completely free to use. We believe developers should be able to launch projects without worrying about domain costs. We may offer premium features in the future, but the core service will always be free.",
  },
  {
    question: "Do I get full DNS control?",
    answer:
      "You get control over DNS records for your subdomain (A, AAAA, CNAME, TXT, MX). This lets you point to any IP address, load balancer, or service you want.",
  },
  {
    question: "Is this suitable for production?",
    answer:
      "Doofs is great for side projects, demos, and MVPs. For production apps with significant traffic or commercial use, we recommend getting your own domain. That said, our infrastructure is reliable and we aim for high uptime.",
  },
  {
    question: "Are there any limits?",
    answer:
      "Each account can claim up to 5 domains during the beta period. We also have reasonable rate limits to protect the platform. Limits may change as we scale.",
  },
  {
    question: "Can my subdomain be removed?",
    answer:
      "Subdomains can be removed if they're used for abuse, spam, or illegal content. Inactive subdomains (no DNS activity for 90+ days) may also be reclaimed. We'll always try to notify you before taking action.",
  },
];

export const FAQ = () => {
  return (
    <section className="py-8 sm:py-10 md:py-12 px-4 bg-background">
      <div className="container max-w-2xl mx-auto">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-6 md:mb-8">
          Frequently asked questions
        </h2>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border/50 bg-secondary/50 rounded-lg px-3 md:px-4 data-[state=open]:bg-secondary data-[state=open]:border-border transition-all"
            >
              <AccordionTrigger className="text-left text-xs sm:text-sm font-medium hover:no-underline py-2.5 md:py-3">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-xs sm:text-sm pb-2.5 md:pb-3 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
