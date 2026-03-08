import { runTempQuotattionServiceFactoryTests } from "./tempQuotattion.service.factory.test";
import { runTempQuotattionRepositoryFactoryTests } from "./tempQuotattion.repository.factory.test";

declare const process: { exit(code?: number): never };

async function main(): Promise<void> {
  await runTempQuotattionServiceFactoryTests();
  console.log("PASS tempQuotattion.service.factory.test");

  await runTempQuotattionRepositoryFactoryTests();
  console.log("PASS tempQuotattion.repository.factory.test");

  console.log("All temp-quick-quotation tests passed.");
}

main().catch((error) => {
  console.error("Temp quick quotation tests failed:");
  console.error(error);
  process.exit(1);
});
