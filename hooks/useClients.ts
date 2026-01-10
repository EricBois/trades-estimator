"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface Client {
  id: string;
  contractorId: string;
  name: string;
  email: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

function toClient(c: {
  id: string;
  contractor_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}): Client {
  return {
    id: c.id,
    contractorId: c.contractor_id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    street: c.street,
    city: c.city,
    state: c.state,
    zip: c.zip,
    notes: c.notes,
    createdAt: c.created_at ?? new Date().toISOString(),
    updatedAt: c.updated_at ?? new Date().toISOString(),
  };
}

export function useClients(contractorId: string | undefined) {
  return useQuery({
    queryKey: ["clients", contractorId],
    queryFn: async (): Promise<Client[]> => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("contractor_id", contractorId!)
        .order("name", { ascending: true });

      if (error) throw error;

      return (data ?? []).map(toClient);
    },
    enabled: !!contractorId,
  });
}

export function useClient(clientId: string | undefined) {
  return useQuery({
    queryKey: ["client", clientId],
    queryFn: async (): Promise<Client | null> => {
      if (!clientId) return null;

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (error) throw error;

      return toClient(data);
    },
    enabled: !!clientId,
  });
}

export interface CreateClientInput {
  contractorId: string;
  name: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateClientInput): Promise<Client> => {
      const { data, error } = await supabase
        .from("clients")
        .insert({
          contractor_id: input.contractorId,
          name: input.name,
          email: input.email ?? null,
          phone: input.phone ?? null,
          street: input.street ?? null,
          city: input.city ?? null,
          state: input.state ?? null,
          zip: input.zip ?? null,
          notes: input.notes ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      return toClient(data);
    },
    onSuccess: (client) => {
      queryClient.invalidateQueries({
        queryKey: ["clients", client.contractorId],
      });
    },
  });
}

export interface UpdateClientInput {
  id: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  notes?: string | null;
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateClientInput): Promise<Client> => {
      const { data, error } = await supabase
        .from("clients")
        .update({
          name: input.name,
          email: input.email,
          phone: input.phone,
          street: input.street,
          city: input.city,
          state: input.state,
          zip: input.zip,
          notes: input.notes,
        })
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;

      return toClient(data);
    },
    onSuccess: (client) => {
      queryClient.invalidateQueries({
        queryKey: ["clients", client.contractorId],
      });
      queryClient.invalidateQueries({
        queryKey: ["client", client.id],
      });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      // Get the client first to know the contractor ID
      const { data: client } = await supabase
        .from("clients")
        .select("contractor_id")
        .eq("id", id)
        .single();

      const { error } = await supabase.from("clients").delete().eq("id", id);

      if (error) throw error;

      return client?.contractor_id ?? "";
    },
    onSuccess: (contractorId) => {
      queryClient.invalidateQueries({
        queryKey: ["clients", contractorId],
      });
    },
  });
}
