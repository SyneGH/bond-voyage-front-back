import { Filter, Calendar, DollarSign } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface BookingFilterContentProps {
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  travelDateFrom: string;
  onTravelDateFromChange: (value: string) => void;
  travelDateTo: string;
  onTravelDateToChange: (value: string) => void;
  minAmount: string;
  onMinAmountChange: (value: string) => void;
  maxAmount: string;
  onMaxAmountChange: (value: string) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export function BookingFilterContent({
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  travelDateFrom,
  onTravelDateFromChange,
  travelDateTo,
  onTravelDateToChange,
  minAmount,
  onMinAmountChange,
  maxAmount,
  onMaxAmountChange,
  onApplyFilters,
  onResetFilters,
}: BookingFilterContentProps) {
  return (
    <>
      <div className="p-5 bg-gradient-to-br from-[#F8FAFB] to-white border-b border-[#E5E7EB]/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0A7AFF] to-[#3B9EFF] flex items-center justify-center shadow-lg shadow-[#0A7AFF]/20">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1A2B4F]">Filter Bookings</h3>
            <p className="text-xs text-[#64748B] mt-0.5">Refine your search results</p>
          </div>
        </div>
      </div>
      <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
        <div>
          <Label className="text-sm font-medium text-[#1A2B4F] mb-2.5 block flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Booking Date Range
          </Label>
          <div className="space-y-3">
            <div>
              <Label htmlFor="booking-date-from" className="text-xs text-[#64748B] mb-1.5 block">
                From
              </Label>
              <Input
                id="booking-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10"
              />
            </div>
            <div>
              <Label htmlFor="booking-date-to" className="text-xs text-[#64748B] mb-1.5 block">
                To
              </Label>
              <Input
                id="booking-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className="h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10"
              />
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-[#1A2B4F] mb-2.5 block flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Travel Date Range
          </Label>
          <div className="space-y-3">
            <div>
              <Label htmlFor="travel-date-from" className="text-xs text-[#64748B] mb-1.5 block">
                From
              </Label>
              <Input
                id="travel-date-from"
                type="date"
                value={travelDateFrom}
                onChange={(e) => onTravelDateFromChange(e.target.value)}
                className="h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10"
              />
            </div>
            <div>
              <Label htmlFor="travel-date-to" className="text-xs text-[#64748B] mb-1.5 block">
                To
              </Label>
              <Input
                id="travel-date-to"
                type="date"
                value={travelDateTo}
                onChange={(e) => onTravelDateToChange(e.target.value)}
                className="h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10"
              />
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-[#1A2B4F] mb-2.5 block flex items-center gap-2">
            <span className="text-[#10B981]">₱</span>
            Amount Range
          </Label>
          <div className="space-y-3">
            <div>
              <Label htmlFor="min-amount" className="text-xs text-[#64748B] mb-1.5 block">
                Minimum Amount
              </Label>
              <Input
                id="min-amount"
                type="number"
                placeholder="0"
                value={minAmount}
                onChange={(e) => onMinAmountChange(e.target.value)}
                className="h-11 border-[#E5E7EB] focus:border-[#0A7AFF] focus:ring-[#0A7AFF]/10"
              />
            </div>
            <div>
              <Label htmlFor="max-amount" className="text-xs text-[#64748B] mb-1.5 block">
                Maximum Amount
              </Label>
              <Input
                id="max-amount"
                type="number"
                placeholder="100000"
                value={maxAmount}
                onChange={(e) => onMaxAmountChange(e.target.value)}
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
          className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#0A7AFF] to-[#3B9EFF] hover:from-[#0865CC] hover:to-[#2E8FE8] shadow-lg shadow-[#0A7AFF]/20 text-white"
        >
          Apply Filters
        </Button>
      </div>
    </>
  );
}
