export function PageHeading({ title, description }: { title: string; description: string }) { return <header className="mb-7"><h1 className="m-0 text-3xl font-semibold tracking-tight">{title}</h1><p className="muted mt-1">{description}</p></header>; }

