import { getJsonLd } from "@/lib/seo";

/** Inserta el schema JSON-LD original (Rank Math) de la página. */
export default function JsonLd({ path }: { path: string }) {
  const data = getJsonLd(path);
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      className="rank-math-schema-pro"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
