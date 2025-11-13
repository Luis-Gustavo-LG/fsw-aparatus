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