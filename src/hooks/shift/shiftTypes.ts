
import { RateType } from "../useShiftState";

export interface ShiftState {
  isShiftActive: boolean;
  isBreakActive: boolean;
  isStartSignatureOpen: boolean;
  isEndSignatureOpen: boolean;
  isShiftComplete: boolean;
  managerName: string;
  endManagerName: string;
  startTime: Date | null;
  endTime: Date | null;
  breakStart: Date | null;
  totalBreakDuration: number;
  employerName: string;
  payRate: number;
  rateType: RateType;
  startSignatureData: string | null;
  endSignatureData: string | null;
  isStartSignatureEmpty: boolean;
  isEndSignatureEmpty: boolean;
  showValidationAlert: boolean;
  validationType: 'start' | 'end';
}

export interface ShiftActions {
  handleStartShift: () => void;
  handleEndShift: () => void;
  confirmShiftStart: () => void;
  confirmShiftEnd: (userId: string | undefined) => Promise<void>;
}
