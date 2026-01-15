export interface WodScheduleDto {
  id: string;
  date: string;           
  startTime: string;      
  endTime: string;        
  workoutDescription: string;
  capacity: number;
  bookedCount: number;
}

export interface BookingResponseDto {
  id: string;
  wodScheduleId: string;
  timestamp: string;
}

export interface AdminMemberDto {
  username: string;
  email: string;
  createdAt: string; // ISO
}