export const onRequest = (): Response => {
  const card = {
    name: "firmometr",
    title: "Firmometr",
    description:
      "Czech company intelligence API aggregating ARES business registry, ISIR insolvency register, VAT payers database, and the commercial register (OR).",
    version: "1.0.0",
    websiteUrl: "https://firmometr.cz",
    serverInfo: {
      name: "firmometr",
      version: "1.0.0",
    },
    transport: {
      endpoint: "https://firmometr.cz/mcp",
    },
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
    tools: [
      {
        name: "searchCompanies",
        description:
          "Search Czech companies by name using the ARES business registry. Returns up to 20 results per page.",
      },
      {
        name: "getCompanyByIco",
        description:
          "Get full company profile by IČO (Czech business ID): registration data, address, insolvency status (ISIR), VAT reliability (DPH), statutory officers, and commercial register links.",
      },
    ],
    prompts: [],
    resources: [],
  };

  return new Response(JSON.stringify(card, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
