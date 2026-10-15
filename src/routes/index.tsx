import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { originalSiteHtml } from "@/components/original-site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Móveis planejados e marcenaria sob medida em Garça | PLANE GAR" },
      { name: "description", content: "PLANE GAR: móveis planejados e marcenaria sob medida em Garça e região. Cozinhas, quartos, closets e ambientes comerciais. Orçamento grátis." },
      { property: "og:title", content: "PLANE GAR — Móveis planejados em Garça" },
      { property: "og:description", content: "Móveis planejados e marcenaria sob medida em Garça e região, do projeto à instalação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const site = container.current;
    if (!site) return;
    const menu = site.querySelector<HTMLElement>("[data-mobile-menu]");
    const menuButton = site.querySelector<HTMLButtonElement>('button[aria-label="Abrir menu"]');
    const filterButtons = Array.from(site.querySelectorAll<HTMLButtonElement>("#portfolio button"));
    const figures = Array.from(site.querySelectorAll<HTMLElement>("#portfolio figure"));
    const faqButtons = Array.from(site.querySelectorAll<HTMLButtonElement>("#faq button"));
    const selectedClass = filterButtons[0]?.className ?? "";
    const idleClass = filterButtons[1]?.className ?? "";

    function closeMenu() {
      if (!menu || !menuButton) return;
      menu.hidden = true;
      menuButton.setAttribute("aria-expanded", "false");
      const icon = menuButton.querySelector("i");
      if (icon) icon.className = "ri-menu-line text-2xl";
    }

    function handleClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest("button");
      if (button === menuButton && menu && menuButton) {
        menu.hidden = !menu.hidden;
        menuButton.setAttribute("aria-expanded", String(!menu.hidden));
        const icon = menuButton.querySelector("i");
        if (icon) icon.className = menu.hidden ? "ri-menu-line text-2xl" : "ri-close-line text-2xl";
      }
      if (button instanceof HTMLButtonElement && filterButtons.includes(button)) {
        const category = button.textContent?.trim();
        filterButtons.forEach((item) => { item.className = item === button ? selectedClass : idleClass; item.setAttribute("aria-pressed", String(item === button)); });
        figures.forEach((figure) => { figure.hidden = category !== "Todos" && figure.querySelector("figcaption span")?.textContent?.trim() !== category; });
      }
      if (button instanceof HTMLButtonElement && faqButtons.includes(button)) {
        const wasOpen = button.getAttribute("aria-expanded") === "true";
        faqButtons.forEach((item) => {
          const open = item === button && !wasOpen;
          item.setAttribute("aria-expanded", String(open));
          item.querySelector("span")?.classList.toggle("rotate-180", open);
          const answer = item.nextElementSibling;
          if (answer instanceof HTMLElement) answer.hidden = !open;
        });
      }
      if (event.target.closest("[data-mobile-menu] a")) closeMenu();
    }
    const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") closeMenu(); };
    menuButton?.setAttribute("aria-expanded", "false");
    site.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => { site.removeEventListener("click", handleClick); document.removeEventListener("keydown", handleKey); };
  }, []);

  return <div ref={container} dangerouslySetInnerHTML={{ __html: originalSiteHtml }} />;
}
