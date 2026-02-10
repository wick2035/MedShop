import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HospitalContextState {
  selectedHospitalId: string | null;
  setHospitalId: (id: string | null) => void;
}

export const useHospitalContextStore = create<HospitalContextState>()(
  persist(
    (set) => ({
      selectedHospitalId: null,

      setHospitalId: (id: string | null) => {
        set({ selectedHospitalId: id });
      },
    }),
    {
      name: 'medpay_hospital_context',
    },
  ),
);
