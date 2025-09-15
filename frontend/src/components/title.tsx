import { cn } from '@/lib/utils'
import React from 'react'

const Title = ({ children, dir, className }: { children: React.ReactNode, dir?: string, className?: string }) => {
    return (
        <h1 dir={dir} className={cn('text-2xl font-bold', className)}>
            {children}
        </h1>
    )
}

export default Title