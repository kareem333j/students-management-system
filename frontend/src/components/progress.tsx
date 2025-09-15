"use client"

import { cn } from "@/lib/utils"
import * as React from "react"

export function LoadingLinear({loading}: {loading: boolean}) {
    if (!loading) {
        return null
    }
    return (
        <div className="w-full h-[100vh] z-900 fixed top-0 left-0 bg-gray-500/20">
            <div className="relative w-full h-1.5 bg-muted overflow-hidden rounded-full">
                <div
                    className={cn(
                        "absolute left-0 top-0 h-full w-1/3 bg-primary/70 animate-loading"
                    )}
                />
            </div>
        </div>
    )
}
