const getInitials = (name) => {
  if (!name) return "";
  
  const names = name.split(" ");
  if (names.length === 1)
    return (names[0][0] + names[0][names[0].length - 1]).toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

export { getInitials };
