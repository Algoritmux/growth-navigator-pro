import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { createLead } from "@/lib/leadsApi";
import { leadEventParams, trackEvent } from "@/lib/analytics";
import { ContactPrivacyNotice, MarketingOptIn } from "@/components/privacy/FormPrivacy";

interface ContactDialogProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export function ContactDialog({
    children,
    title = "Solicitar um contato",
    description = "Preencha os campos abaixo e entrarei em contato o mais breve possível para discutirmos como posso ajudar seu negócio."
}: ContactDialogProps) {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [marketingOptIn, setMarketingOptIn] = React.useState(false);
    const optInId = React.useId();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        setLoading(true);

        const formData = new FormData(form);
        const data = {
            name: String(formData.get("name") || ""),
            email: String(formData.get("email") || ""),
            phone: String(formData.get("phone") || ""),
            message: String(formData.get("message") || ""),
            service: title,
            source: "contact-dialog",
            marketing_opt_in: marketingOptIn,
        };

        try {
            await createLead(data);

            toast.success("Solicitação enviada!", {
                description: "Obrigado pelo contato. Em breve falaremos!",
            });

            form.reset();
            setMarketingOptIn(false);
            setOpen(false);
        } catch (error) {
            toast.error("Não foi possível enviar a solicitação.", {
                description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (next) {
                    trackEvent("open_contact_form", { ...leadEventParams("contact-dialog"), service: title });
                }
                setOpen(next);
            }}
        >
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input id="name" name="name" placeholder="Seu nome" required className="rounded-xl" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">E-mail corporativo</Label>
                        <Input id="email" name="email" type="email" placeholder="seu@email.com" required className="rounded-xl" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Telefone / WhatsApp</Label>
                        <Input id="phone" name="phone" placeholder="(00) 00000-0000" required className="rounded-xl" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="message">Como posso ajudar?</Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="Conte um pouco sobre seu desafio..."
                            className="min-h-[100px] rounded-xl"
                            required
                        />
                    </div>
                    <MarketingOptIn id={optInId} checked={marketingOptIn} onCheckedChange={setMarketingOptIn} />
                    <Button type="submit" variant="accent" className="w-full h-12 rounded-xl mt-2 font-bold" disabled={loading}>
                        {loading ? (
                            "Enviando..."
                        ) : (
                            <>
                                Enviar solicitação <Send className="ml-2 w-4 h-4" />
                            </>
                        )}
                    </Button>
                    <ContactPrivacyNotice />
                </form>
            </DialogContent>
        </Dialog>
    );
}
