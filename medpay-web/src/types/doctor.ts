export interface DoctorResponse {
  id: string;
  hospitalId: string;
  userId: string;
  departmentId: string | null;
  fullName: string;
  title: string;
  specialty: string;
  licenseNumber: string;
  bio: string;
  consultationFee: number;
  isAcceptingPatients: boolean;
  ratingScore: number;
  totalRatings: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}
