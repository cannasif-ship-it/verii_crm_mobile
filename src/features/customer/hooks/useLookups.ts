import { useQuery } from "@tanstack/react-query";
import { lookupApi } from "../api/lookupApi";
import type { CountryDto, CityDto, DistrictDto, CustomerTypeDto, TitleDto } from "../types";

const LOOKUP_STALE_TIME = 10 * 60 * 1000;

export function useCountries() {
  return useQuery<CountryDto[], Error>({
    queryKey: ["lookup", "countries"],
    queryFn: lookupApi.getCountries,
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useCities(countryId?: number) {
  return useQuery<CityDto[], Error>({
    queryKey: ["lookup", "cities", countryId],
    queryFn: () => lookupApi.getCities(countryId),
    staleTime: LOOKUP_STALE_TIME,
    enabled: !!countryId,
  });
}

export function useDistricts(cityId?: number) {
  return useQuery<DistrictDto[], Error>({
    queryKey: ["lookup", "districts", cityId],
    queryFn: () => lookupApi.getDistricts(cityId),
    staleTime: LOOKUP_STALE_TIME,
    enabled: !!cityId,
  });
}

export function useCustomerTypes() {
  return useQuery<CustomerTypeDto[], Error>({
    queryKey: ["lookup", "customerTypes"],
    queryFn: lookupApi.getCustomerTypes,
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useTitles() {
  return useQuery<TitleDto[], Error>({
    queryKey: ["lookup", "titles"],
    queryFn: lookupApi.getTitles,
    staleTime: LOOKUP_STALE_TIME,
  });
}
