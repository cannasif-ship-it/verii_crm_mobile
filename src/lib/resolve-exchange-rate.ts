type ExchangeRateFormLike = {
  currency: string;
  exchangeRate: number;
  dovizTipi?: number;
};

type ExchangeRateLike = {
  dovizTipi: number;
  dovizIsmi: string | null;
  kurDegeri: number;
};

type CurrencyOptionLike = {
  code: string;
  dovizTipi: number;
  dovizIsmi: string | null;
};

function normalizeCurrencyValue(value: string | null | undefined): string {
  return (value ?? "").trim().toUpperCase();
}

function resolveCurrencyAliases(value: string): string[] {
  const normalized = normalizeCurrencyValue(value);
  if (!normalized) return [];

  const aliases = new Set<string>([normalized]);

  switch (normalized) {
    case "TL":
    case "TRY":
    case "TURK LIRASI":
    case "TÜRK LİRASI":
      aliases.add("TL");
      aliases.add("TRY");
      aliases.add("TURK LIRASI");
      aliases.add("TÜRK LİRASI");
      break;
    case "USD":
    case "DOLAR":
    case "AMERIKAN DOLARI":
    case "AMERİKAN DOLARI":
    case "ABD DOLARI":
      aliases.add("USD");
      aliases.add("DOLAR");
      aliases.add("AMERIKAN DOLARI");
      aliases.add("AMERİKAN DOLARI");
      aliases.add("ABD DOLARI");
      break;
    case "EUR":
    case "EURO":
      aliases.add("EUR");
      aliases.add("EURO");
      break;
    case "GBP":
    case "STERLIN":
    case "STERLİN":
    case "İNGILIZ STERLINI":
    case "İNGİLİZ STERLİNİ":
    case "INGILIZ STERLINI":
    case "İNGILIZ STERLINI":
      aliases.add("GBP");
      aliases.add("STERLIN");
      aliases.add("STERLİN");
      aliases.add("INGILIZ STERLINI");
      aliases.add("İNGILIZ STERLINI");
      aliases.add("İNGİLİZ STERLİNİ");
      break;
    default:
      break;
  }

  return Array.from(aliases);
}

function findCurrencyOption(
  currency: string,
  currencyOptions?: CurrencyOptionLike[]
): CurrencyOptionLike | undefined {
  const aliases = resolveCurrencyAliases(currency);
  if (aliases.length === 0) return undefined;

  return currencyOptions?.find((option) => {
    const optionCode = normalizeCurrencyValue(option.code);
    const optionName = normalizeCurrencyValue(option.dovizIsmi);
    return aliases.includes(optionCode) || aliases.includes(optionName);
  });
}

function findFormRate(
  currency: string,
  formRates: ExchangeRateFormLike[],
  currencyOption?: CurrencyOptionLike
): number | undefined {
  const aliases = resolveCurrencyAliases(currency);

  const directRate = formRates.find((rate) => {
    const rateCurrency = normalizeCurrencyValue(rate.currency);
    return aliases.includes(rateCurrency);
  })?.exchangeRate;
  if (directRate != null && directRate > 0) return directRate;

  const currencyAsNumber = Number(currency);
  if (!Number.isNaN(currencyAsNumber)) {
    const numericRate = formRates.find(
      (rate) => rate.dovizTipi === currencyAsNumber || Number(rate.currency) === currencyAsNumber
    )?.exchangeRate;
    if (numericRate != null && numericRate > 0) return numericRate;
  }

  if (currencyOption) {
    const optionRate = formRates.find(
      (rate) =>
        rate.dovizTipi === currencyOption.dovizTipi ||
        Number(rate.currency) === currencyOption.dovizTipi
    )?.exchangeRate;
    if (optionRate != null && optionRate > 0) return optionRate;
  }

  return undefined;
}

function findErpRate(
  currency: string,
  erpRates: ExchangeRateLike[] | undefined,
  currencyOption?: CurrencyOptionLike
): number | undefined {
  if (!erpRates || erpRates.length === 0) return undefined;

  const aliases = resolveCurrencyAliases(currency);

  const namedRate = erpRates.find((rate) => {
    const rateName = normalizeCurrencyValue(rate.dovizIsmi);
    return aliases.includes(rateName);
  })?.kurDegeri;
  if (namedRate != null && namedRate > 0) return namedRate;

  const currencyAsNumber = Number(currency);
  if (!Number.isNaN(currencyAsNumber)) {
    const numericRate = erpRates.find((rate) => rate.dovizTipi === currencyAsNumber)?.kurDegeri;
    if (numericRate != null && numericRate > 0) return numericRate;
  }

  if (currencyOption) {
    const optionRate = erpRates.find(
      (rate) => rate.dovizTipi === currencyOption.dovizTipi
    )?.kurDegeri;
    if (optionRate != null && optionRate > 0) return optionRate;
  }

  return undefined;
}

export function resolveExchangeRateByCurrency(
  currency: string,
  formRates: ExchangeRateFormLike[],
  erpRates: ExchangeRateLike[] | undefined,
  currencyOptions?: CurrencyOptionLike[]
): number | undefined {
  if (!currency) return undefined;

  const currencyOption = findCurrencyOption(currency, currencyOptions);
  const formRate = findFormRate(currency, formRates, currencyOption);
  if (formRate != null && formRate > 0) return formRate;

  return findErpRate(currency, erpRates, currencyOption);
}
