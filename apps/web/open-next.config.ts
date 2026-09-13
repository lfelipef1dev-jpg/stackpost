import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * @type {import('@opennextjs/cloudflare').OpenNextConfig}
 */
const config = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      // Prerendered pages/rotas estaticas sao servidas do ASSETS binding.
      // Com "dummy", TODO request de pagina fazia SSR completo (re-render React),
      // alocando ~1MB por request e estourando a memoria do isolate (Error 1102).
      incrementalCache: () => staticAssetsIncrementalCache,
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  edgeExternals: ["node:crypto"],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      // incrementalCache real aqui: com enableCacheInterception, paginas
      // prerenderizadas em cache sao servidas pela camada middleware (~0,7MB)
      // sem avaliar o bundle do servidor (~52MB) — derruba o TTFB de cold start.
      incrementalCache: () => staticAssetsIncrementalCache,
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  dangerous: {
    enableCacheInterception: true,
  },
};

module.exports = config;
