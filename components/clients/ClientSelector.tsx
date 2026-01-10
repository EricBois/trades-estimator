"use client";

import { useState, useMemo } from "react";
import {
  User,
  Search,
  Plus,
  ChevronDown,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useClients, useCreateClient } from "@/hooks/useClients";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface ClientSelectorProps {
  value: string | null;
  onChange: (clientId: string | null) => void;
  onClientSelect?: (client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  }) => void;
  className?: string;
  placeholder?: string;
}

export function ClientSelector({
  value,
  onChange,
  onClientSelect,
  className,
  placeholder = "Select a client...",
}: ClientSelectorProps) {
  const { profile } = useAuth();
  const { data: clients, isLoading } = useClients(profile?.id);
  const createClient = useCreateClient();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newClientName, setNewClientName] = useState("");

  // Filter clients by search
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    if (!search) return clients;
    const searchLower = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower)
    );
  }, [clients, search]);

  // Get selected client
  const selectedClient = useMemo(() => {
    if (!value || !clients) return null;
    return clients.find((c) => c.id === value) ?? null;
  }, [value, clients]);

  const handleSelect = (client: NonNullable<typeof clients>[number] | null) => {
    if (client) {
      onChange(client.id);
      onClientSelect?.({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
      });
    } else {
      onChange(null);
    }
    setIsOpen(false);
    setSearch("");
  };

  const handleCreateClient = async () => {
    if (!newClientName.trim() || !profile) return;

    try {
      const client = await createClient.mutateAsync({
        contractorId: profile.id,
        name: newClientName.trim(),
      });
      handleSelect(client);
      setIsCreating(false);
      setNewClientName("");
    } catch (error) {
      console.error("Failed to create client:", error);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trigger */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={cn(
          "w-full min-h-[48px] px-4 py-3 text-left cursor-pointer",
          "border border-gray-300 rounded-xl bg-white",
          "hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "flex items-center justify-between gap-2",
          "transition-colors"
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <User className="w-4 h-4 text-gray-400 shrink-0" />
          {selectedClient ? (
            <span className="text-gray-900 truncate">{selectedClient.name}</span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {selectedClient && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(null);
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setIsOpen(false);
              setSearch("");
              setIsCreating(false);
            }}
          />

          {/* Dropdown Panel */}
          <div className="absolute z-20 mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search clients..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Client List */}
            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Loading clients...
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {search ? "No clients found" : "No clients yet"}
                </div>
              ) : (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleSelect(client)}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3",
                      value === client.id && "bg-blue-50"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {client.name}
                      </div>
                      {client.email && (
                        <div className="text-sm text-gray-500 truncate">
                          {client.email}
                        </div>
                      )}
                    </div>
                    {value === client.id && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Create New Client */}
            <div className="border-t border-gray-100 p-3">
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Client name"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateClient();
                      }
                      if (e.key === "Escape") {
                        setIsCreating(false);
                        setNewClientName("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateClient}
                    disabled={!newClientName.trim() || createClient.isPending}
                    className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createClient.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setNewClientName("");
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add new client
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
