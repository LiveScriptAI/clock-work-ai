
import { useState } from "react";

export type ValidationType = 'start' | 'end' | 'employer' | 'manager' | 'endManager' | 'startSignature' | 'endSignature';

export function useShiftValidation() {
  const [isStartSignatureEmpty, setIsStartSignatureEmpty] = useState(true);
  const [isEndSignatureEmpty, setIsEndSignatureEmpty] = useState(true);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationType, setValidationType] = useState<ValidationType>('start');
  
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
