export const onRequest = (): Response => {
  const index = {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: "search-companies",
        type: "skill-md",
        description:
          "Search Czech companies by name using the Firmometr API backed by the ARES business registry. Returns up to 20 results per page with IČO, name, and address.",
        url: "/.well-known/agent-skills/search-companies/SKILL.md",
        digest:
          "sha256:48b2aa7b86d457b34f0aee0703e0d63cf28e120e1d718374a303828ae3fc4ce8",
      },
      {
        name: "get-company-by-ico",
        type: "skill-md",
        description:
          "Get full Czech company profile by IČO (8-digit business ID) aggregating ARES registry, ISIR insolvency register, VAT reliability database, and commercial register.",
        url: "/.well-known/agent-skills/get-company-by-ico/SKILL.md",
        digest:
          "sha256:b7cebfdf96470e1c9960ea3d1ff578152b009b32b2d374437429c5feb924af9e",
      },
    ],
  };

  return new Response(JSON.stringify(index, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
