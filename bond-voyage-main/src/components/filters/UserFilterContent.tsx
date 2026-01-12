import { Filter, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface UserFilterContentProps {
  roleFilter?: "all" | "USER" | "ADMIN";
  onRoleFilterChange?: (value: "all" | "USER" | "ADMIN") => void;
  statusFilter: "all" | "Active" | "Deactivated";
  onStatusFilterChange: (value: "all" | "Active" | "Deactivated") => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export function UserFilterContent({
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onApplyFilters,
  onResetFilters,
}: UserFilterContentProps) {
  return (
    <div className="overflow-auto" style={{ height: 300 }}>
      <div className="p-5 bg-linear-to-br from-[#F8FAFB] to-white border-b border-[#E5E7EB]/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1A2B4F]">Filter Users</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Refine your search results
            </p>
          </div>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <Label className="text-sm font-medium text-[#1A2B4F] mb-2.5 block">
            Status
          </Label>
          <Select
            value={statusFilter}
            onValueChange={(v: string) =>
              onStatusFilterChange(v as "all" | "Active" | "Deactivated")
            }
          >
            <SelectTrigger className="w-full h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Deactivated">Deactivated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-[#1A2B4F] mb-2.5  flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range (User Since)
          </Label>
          <div className="space-y-3">
            <div>
              <Label
                htmlFor="date-from"
                className="text-xs text-[#64748B] mb-1.5 block"
              >
                From
              </Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10"
              />
            </div>
            <div>
              <Label
                htmlFor="date-to"
                className="text-xs text-[#64748B] mb-1.5 block"
              >
                To
              </Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className="h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 bg-[#F8FAFB]/50 border-t border-[#E5E7EB]/50 flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onResetFilters}
          className="flex-1 h-10 rounded-xl border-[#E5E7EB] hover:bg-white"
        >
          Reset
        </Button>
        <Button
          onClick={onApplyFilters}
          className="flex-1 h-10 rounded-xl bg-linear-to-r from-[#0A7AFF] to-[#3B9EFF] hover:from-[#0865CC] hover:to-[#2E8FE8] shadow-lg shadow-[#0A7AFF]/20 text-white"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
