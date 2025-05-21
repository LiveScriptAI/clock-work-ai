
import { useState } from "react";

export function useShiftValidation() {
  const [isStartSignatureEmpty, setIsStartSignatureEmpty] = useState(true);
  const [isEndSignatureEmpty, setIsEndSignatureEmpty] = useState(true);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationType, setValidationType] = useState<'start' | 'end'>('start');
  
  return {
    isStartSignatureEmpty,
    isEndSignatureEmpty,
    showValidationAlert,
    validationType,
    setIsStartSignatureEmpty,
    setIsEndSignatureEmpty,
    setShowValidationAlert,
    setValidationType
  };
}
