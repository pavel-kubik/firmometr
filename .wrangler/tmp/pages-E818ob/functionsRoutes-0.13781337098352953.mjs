import { onRequest as __api_v1_search_ico__ico__ts_onRequest } from "/Users/pavel/code/firmometr/functions/api/v1/search/ico/[ico].ts"
import { onRequest as __api_v1_cap_reset_ts_onRequest } from "/Users/pavel/code/firmometr/functions/api/v1/cap-reset.ts"
import { onRequest as __api_v1_search_ts_onRequest } from "/Users/pavel/code/firmometr/functions/api/v1/search.ts"

export const routes = [
    {
      routePath: "/api/v1/search/ico/:ico",
      mountPath: "/api/v1/search/ico",
      method: "",
      middlewares: [],
      modules: [__api_v1_search_ico__ico__ts_onRequest],
    },
  {
      routePath: "/api/v1/cap-reset",
      mountPath: "/api/v1",
      method: "",
      middlewares: [],
      modules: [__api_v1_cap_reset_ts_onRequest],
    },
  {
      routePath: "/api/v1/search",
      mountPath: "/api/v1",
      method: "",
      middlewares: [],
      modules: [__api_v1_search_ts_onRequest],
    },
  ]