export const calculateAge = (birth_date: string): number => {
  const birth = new Date(birth_date);
  const today = new Date();

  // Extraire l'année, le mois et le jour de la date de naissance
  const birthYear = birth.getUTCFullYear();
  const birthMonth = birth.getUTCMonth(); // 0 = Janvier, 11 = Décembre
  const birthDay = birth.getUTCDate();

  // Extraire l'année, le mois et le jour d'aujourd'hui
  const todayYear = today.getUTCFullYear();
  const todayMonth = today.getUTCMonth();
  const todayDay = today.getUTCDate();

  let age = todayYear - birthYear;

  // Si l'anniversaire n'est pas encore passé cette année, on enlève 1 an
  if (todayMonth < birthMonth || (todayMonth === birthMonth && todayDay < birthDay)) {
    age--;
  }

  return age;
};
