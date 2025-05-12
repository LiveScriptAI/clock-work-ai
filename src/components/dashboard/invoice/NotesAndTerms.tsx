
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesAndTermsProps {
  notes: string;
  setNotes: (value: string) => void;
  terms: string;
  setTerms: (value: string) => void;
}

const NotesAndTerms: React.FC<NotesAndTermsProps> = ({
  notes,
  setNotes,
  terms,
  setTerms,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes to the customer..."
          className="min-h-32"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="terms">Terms & Conditions</Label>
        <Textarea
          id="terms"
          placeholder="Payment terms and conditions..."
          className="min-h-32"
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
        />
      </div>
    </div>
  );
};

export default NotesAndTerms;
