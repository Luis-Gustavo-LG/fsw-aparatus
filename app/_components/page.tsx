export const PageContainer = ({ children }: {children: React.ReactNode }) => {
    return <div className="p-5 space-y-6">{children}</div>
}

export const PageSectionTitle = ({ children }: {children: React.ReactNode }) => {
    return <div className="text-foreground text-xs font-semibold uppercase">{children}</div>
}

export const PageSection = ({ children }: {children: React.ReactNode }) => {
    return <div className="space-y-3">{children}</div>
}

export const PageSectionScroller = ({ children }: {children: React.ReactNode }) => {
    return <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">{children}</div>
}

export const BarbershopSectionTitle = ({ children }: {children: React.ReactNode }) => {
    return (
        <div className="font-bold text-xs leading-[1.4] text-foreground uppercase">
            {children}
        </div>
    )
}

export const BarbershopSeparatorSpacing = ({ children }: {children: React.ReactNode }) => {
    return (
        <div className="px-0 py-6">
            {children}
        </div>
    )
}

export const BarbershopSectionSpacing = ({ children }: {children: React.ReactNode }) => {
    return (
        <div className="px-5 py-0 flex flex-col gap-3">
            {children}
        </div>
    )
}

export const BarbershopSectionCentralizer = ({ children }: {children: React.ReactNode }) => {
    return (
        <div className="flex gap-2.5 items-center justify-center">
            {children}
        </div>
    )
}