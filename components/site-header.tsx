import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function SiteHeader({
  header,
}: {
  header: {
    title: string;
  }[];
}) {
  return (
    <header className="sticky top-0 z-50 lg:relative flex bg-background h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full min-w-0 items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 shrink-0 text-accent-foreground hover:text-accent-foreground/80" />
        <Separator orientation="vertical" className="mx-2 hidden h-7 sm:block" />
        {header.map((item) => (
          <span
            key={item.title}
            className="truncate text-xl font-semibold text-accent-foreground sm:text-2xl"
          >
            {item.title}
          </span>
        ))}
      </div>
    </header>
  );
}
