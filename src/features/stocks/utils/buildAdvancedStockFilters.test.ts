import assert from "node:assert/strict";
import { buildAdvancedStockFilters } from "./buildAdvancedStockFilters";

const result = buildAdvancedStockFilters([
  {
    column: "StockName",
    operator: "contains",
    value: "iphone 17",
  },
]);

assert.equal(result.filterLogic, "or");
assert.deepEqual(result.filters, [
  { column: "StockName", operator: "contains", value: "iphone" },
  { column: "StockName", operator: "contains", value: "17" },
]);

console.log("buildAdvancedStockFilters test passed");
