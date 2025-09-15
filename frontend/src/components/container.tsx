import { cn } from "@/lib/utils"
import { Ref } from "react"

export const Container = ({children, className, ref}:{children:React.ReactNode, className?:string, ref?:Ref<HTMLDivElement>})=>{
    return(
        <div ref={ref} className={cn("w-[100%] max-w-screen-2xl mx-auto px-4",className)}>
            {children}
        </div>
    )
}