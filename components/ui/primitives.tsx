import Link from "next/link";
import type { ReactNode, ComponentProps } from "react";
export function Container({ children }: { children: ReactNode }) {
  return <div className="container">{children}</div>;
}
export function Section({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`section ${className}`}>{children}</section>;
}
export function Grid({ children }: { children: ReactNode }) {
  return <div className="grid">{children}</div>;
}
export function Button({ children, ...props }: ComponentProps<"button">) {
  return (
    <button className="button" {...props}>
      {children}
    </button>
  );
}
export function IconButton({
  label,
  children,
  ...props
}: ComponentProps<"button"> & { label: string }) {
  return (
    <button aria-label={label} className="icon-button" {...props}>
      {children}
    </button>
  );
}
export function TextLink(props: ComponentProps<typeof Link>) {
  return <Link className="text-link" {...props} />;
}
export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Brotkrumennavigation">
      <ol className="breadcrumbs">
        {items.map((item, index) => (
          <li key={index}>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function EditorialCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="editorial-card">
      <h2>{title}</h2>
      {children}
    </article>
  );
}
