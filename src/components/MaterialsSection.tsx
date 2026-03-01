import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getPublishedMaterials, MATERIAL_CATEGORIES, type MaterialItem } from "@/lib/materials-store";

const ITEMS_PER_PAGE = 6;

const chunkMaterials = (items: MaterialItem[], size: number) => {
  const pages: MaterialItem[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
};

const MaterialsSection = () => {
  const materials = getPublishedMaterials();
  const mobileMaterials = materials.slice(0, 3);
  const materialPages = useMemo(() => chunkMaterials(materials, ITEMS_PER_PAGE), [materials]);
  const hasMultiplePages = materialPages.length > 1;

  const renderCard = (item: MaterialItem, i: number) => {
    const isAvailable = Boolean(item.slug) || (Boolean(item.href) && item.href !== "#");

    return (
      <motion.div
        key={item.id}
        className="group flex h-full flex-col rounded-2xl border border-primary/15 p-6 shadow-[0_14px_36px_rgba(24,16,50,0.06)] transition-all duration-300 hover:border-primary/30 hover:shadow-[0_16px_40px_rgba(24,16,50,0.1)]"
        style={{ background: "linear-gradient(180deg, #F8F8FB 0%, #ECEAF3 100%)" }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: i * 0.04 }}
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.05]">
            {(() => {
              const cat = MATERIAL_CATEGORIES.find((c) => c.value === item.type);
              const Icon = cat?.icon;
              return Icon ? <Icon className="h-5 w-5 text-primary/80" /> : null;
            })()}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary/60">{item.type}</span>
        </div>

        <h3 className="mb-3 text-base font-bold leading-snug text-primary">{item.title}</h3>
        <p className="mb-5 text-sm leading-relaxed text-neutral-600">{item.desc}</p>

        {item.tags.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {item.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {isAvailable ? (
          <Button variant="accent" size="sm" className="group/btn h-11 w-full rounded-xl font-semibold text-white hover:text-white" asChild>
            {item.slug ? (
              <Link to={`/biblioteca/${item.slug}`}>
                Acessar <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            ) : (
              <a href={item.href} target="_blank" rel="noreferrer">
                Acessar <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </a>
            )}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="h-11 w-full rounded-xl border border-primary/20 bg-primary/10 text-primary/60 hover:bg-primary/10 hover:text-primary/60"
          >
            Em breve
          </Button>
        )}
      </motion.div>
    );
  };

  return (
    <section id="materiais" className="relative overflow-hidden border-t border-border bg-[#F4F4F7] py-24">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 45%, rgba(138, 16, 175, 0.10) 0%, rgba(138, 16, 175, 0) 72%), linear-gradient(180deg, #F4F4F7 0%, #F1F1F5 100%)",
        }}
      />

      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <motion.div
          className="mx-auto mb-16 max-w-2xl text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">Biblioteca Intelectual</span>
          <h2 className="mt-3 mb-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl">Materiais & Publicacoes</h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Livros, frameworks, pesquisas e guias estrategicos produzidos a partir de experiencia real com empresas.
          </p>
        </motion.div>

        <div className="sm:hidden">
          <div className="mx-auto grid max-w-[1220px] gap-8">
            {mobileMaterials.map((item, i) => renderCard(item, i))}
          </div>
        </div>

        <div className="hidden sm:block">
          {materialPages.length > 0 && (
            <Carousel className="mx-auto max-w-[1220px]" opts={{ align: "start", loop: false }}>
              <CarouselContent className="-ml-0">
                {materialPages.map((page, pageIndex) => (
                  <CarouselItem key={`materials-page-${pageIndex}`} className="pl-0">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                      {page.map((item, i) => renderCard(item, i))}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {hasMultiplePages && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <CarouselPrevious
                    variant="accent"
                    className="static left-auto top-auto h-10 w-10 translate-y-0 rounded-xl border-0 text-white hover:text-white"
                  />
                  <CarouselNext
                    variant="accent"
                    className="static right-auto top-auto h-10 w-10 translate-y-0 rounded-xl border-0 text-white hover:text-white"
                  />
                </div>
              )}
            </Carousel>
          )}
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-primary transition-all text-sm group"
            asChild
          >
            <Link to="/biblioteca">
              Acessar mais materiais
              <ArrowRight className="ml-2 h-4 w-4 opacity-40 transition-opacity group-hover:opacity-100" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default MaterialsSection;
