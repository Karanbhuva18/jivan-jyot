import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addPatient,
  createCompany,
  deletePatient,
  getCompanies,
  getPatients,
  updatePatient,
} from "../api/patientApi";

export const useAddPatient = () => {
  return useMutation({
    mutationFn: addPatient,
  });
};

export const useUpdatePatient = () => {
  return useMutation({
    mutationFn: ({ id, payload }) => updatePatient(id, payload),
  });
};

export const useCompanies = () => {
  return useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries(["companies"]);
    },
  });
};

export const usePatients = (filters) => {
  return useQuery({
    queryKey: ["patients", filters],
    queryFn: () => getPatients(filters),
    keepPreviousData: true,
  });
};

export const useDeletePatient = (filters) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePatient,

    onSuccess: () => {
      queryClient.invalidateQueries(["patients", filters]);
    },
  });
};
