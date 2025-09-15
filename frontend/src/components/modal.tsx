"use client";
import { useCallback, useRef, useEffect, MouseEventHandler } from "react";
import { useRouter } from "next/navigation";
import { Container } from "./container";
import { Button } from "./ui/button";
import { X } from "lucide-react";

export default function Modal({ children }: { children: React.ReactNode }) {
    const overlay = useRef(null);
    const wrapper = useRef(null);
    const router = useRouter();

    const onDismiss = useCallback(() => {
        router.back();
    }, [router]);

    const onClick: MouseEventHandler = useCallback(
        (e) => {
            if (e.target === overlay.current || e.target === wrapper.current) {
                if (onDismiss) onDismiss();
            }
        },
        [onDismiss, overlay, wrapper]
    );

    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onDismiss();
        },
        [onDismiss]
    );

    useEffect(() => {
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [onKeyDown]);

    return (
        <div
            ref={overlay}
            className="fixed z-100 left-0 right-0 top-0 bottom-0 mx-auto bg-black/60 p-10"
            onClick={onClick}
        >
            <Container
                ref={wrapper}
                className="relative h-[90vh] w-[100%] top-1/2 left-1/2 -ml-1 -translate-x-1/2 -translate-y-1/2 p-0 rounded-md overflow-hidden"
            >
                <div dir="rtl" className="w-full flex bg-white py-2 px-5 justify-between items-center">
                    <Button onClick={onDismiss} variant="outline" className="rounded-full p-0 m-0">
                        <X size={50} className="font-bold p-0 m-0" />
                    </Button>
                </div>
                {children}
            </Container>
        </div>
    );
}