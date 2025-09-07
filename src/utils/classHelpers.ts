import { Class } from '@/types';

// Helper functions to handle backward compatibility with old Class structure
export const getClassProfessorIds = (classroom: Class): string[] => {
  // Handle both old and new data structure
  if ('professorIds' in classroom && classroom.professorIds) {
    return classroom.professorIds;
  }
  // @ts-ignore - for backward compatibility
  if ('professorId' in classroom && classroom.professorId) {
    // @ts-ignore
    return [classroom.professorId];
  }
  return [];
};

export const getClassTrailIds = (classroom: Class): string[] => {
  // Handle both old and new data structure
  if ('trailIds' in classroom && classroom.trailIds) {
    return classroom.trailIds;
  }
  // @ts-ignore - for backward compatibility
  if ('trailId' in classroom && classroom.trailId) {
    // @ts-ignore
    return [classroom.trailId];
  }
  return [];
};

export const getFirstProfessorId = (classroom: Class): string | undefined => {
  const professorIds = getClassProfessorIds(classroom);
  return professorIds[0];
};

export const getFirstTrailId = (classroom: Class): string | undefined => {
  const trailIds = getClassTrailIds(classroom);
  return trailIds[0];
};